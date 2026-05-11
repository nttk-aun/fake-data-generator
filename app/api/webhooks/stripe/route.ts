import { NextResponse } from "next/server";
import { getStripe } from "@/lib/billing/stripe-client";
import { handleStripeWebhookEvent, tryClaimStripeEvent } from "@/lib/billing/stripe-webhook";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!stripe || !secret) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const rawBody = await request.text();
    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let event: import("stripe").Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (error) {
      logError("stripe_webhook_signature", error);
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const claimed = await tryClaimStripeEvent(
      event.id,
      event.type,
      event.livemode,
    );
    if (!claimed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await handleStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    logError("POST_api_webhooks_stripe", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
