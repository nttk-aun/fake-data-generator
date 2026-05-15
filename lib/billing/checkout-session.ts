import type Stripe from "stripe";
import {
  findUserIdByStripeCustomerId,
  fulfillProLifetimePurchase,
} from "@/lib/billing/users";
import { logError } from "@/lib/logger";

async function resolveUserIdFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  try {
    const fromMeta = session.metadata?.user_id?.trim();
    if (fromMeta) {
      return fromMeta;
    }
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    if (customerId) {
      return findUserIdByStripeCustomerId(customerId);
    }
    return null;
  } catch (error) {
    logError("resolveUserIdFromCheckoutSession", error);
    return null;
  }
}

/** จ่ายครั้งเดียว (PromptPay / card) — อัปเกรด Pro ตลอดชีพ */
export async function handlePaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  try {
    if (session.mode !== "payment") {
      return;
    }
    if (session.payment_status !== "paid") {
      return;
    }
    const userId = await resolveUserIdFromCheckoutSession(session);
    if (!userId || !session.id) {
      logError(
        "handlePaidCheckoutSession_missing",
        new Error("missing_user_or_session"),
      );
      return;
    }
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
    await fulfillProLifetimePurchase({
      userId,
      checkoutSessionId: session.id,
      paymentIntentId,
      amountCents: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    logError("handlePaidCheckoutSession", error);
  }
}
