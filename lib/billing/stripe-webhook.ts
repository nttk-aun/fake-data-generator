import type Stripe from "stripe";
import { handlePaidCheckoutSession } from "@/lib/billing/checkout-session";
import {
  applyActiveSubscription,
  downgradeUserToFree,
  findUserIdByStripeCustomerId,
} from "@/lib/billing/users";
import { getStripe } from "@/lib/billing/stripe-client";
import { logError } from "@/lib/logger";
import { getSql } from "@/lib/neon";

const PAID_PLAN_SLUG = "pro";

export async function tryClaimStripeEvent(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    return false;
  }
  try {
    const rows = (await sql`
      INSERT INTO stripe_webhook_events (stripe_event_id, event_type)
      VALUES (${eventId}, ${eventType})
      ON CONFLICT (stripe_event_id) DO NOTHING
      RETURNING id::text
    `) as { id: string }[];
    return rows.length > 0;
  } catch (error) {
    logError("tryClaimStripeEvent", error);
    return false;
  }
}

async function syncSubscriptionFromStripe(
  sub: Stripe.Subscription,
): Promise<void> {
  try {
    const userId =
      sub.metadata?.user_id ??
      (await findUserIdByStripeCustomerId(sub.customer as string));
    if (!userId) {
      logError("syncSubscriptionFromStripe_no_user", new Error("missing_user"));
      return;
    }
    const priceId = sub.items.data[0]?.price?.id ?? null;
    await applyActiveSubscription({
      userId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status: sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodStart: sub.current_period_start
        ? new Date(sub.current_period_start * 1000)
        : null,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
      planSlug: PAID_PLAN_SLUG,
    });
  } catch (error) {
    logError("syncSubscriptionFromStripe", error);
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.mode === "payment") {
    await handlePaidCheckoutSession(session);
    return;
  }
  if (session.mode !== "subscription" || !session.subscription) {
    return;
  }
  const stripe = getStripe();
  if (!stripe) {
    return;
  }
  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;
  const sub = await stripe.subscriptions.retrieve(subId);
  await syncSubscriptionFromStripe(sub);
}

export async function handleStripeWebhookEvent(
  event: Stripe.Event,
): Promise<void> {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        return;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(sub);
        return;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          sub.metadata?.user_id ??
          (await findUserIdByStripeCustomerId(sub.customer as string));
        if (userId) {
          await downgradeUserToFree(userId);
        }
        return;
      }
      default:
        return;
    }
  } catch (error) {
    logError("handleStripeWebhookEvent", error);
  }
}
