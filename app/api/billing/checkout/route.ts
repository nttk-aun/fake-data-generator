import { auth } from "@/auth";
import { resolveOneTimePriceId } from "@/lib/billing/resolve-one-time-price";
import {
  ensureUserRowByEmail,
  getUserBillingByEmail,
  setStripeCustomerId,
} from "@/lib/billing/users";
import { getStripe } from "@/lib/billing/stripe-client";
import { logError } from "@/lib/logger";
import { hasDatabaseConfig } from "@/lib/neon";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function baseUrl(): string {
  try {
    const u =
      process.env.AUTH_URL?.trim() ??
      process.env.NEXTAUTH_URL?.trim() ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    return u.replace(/\/$/, "") || "http://localhost:3000";
  } catch (error) {
    logError("billing_checkout_baseUrl", error);
    return "http://localhost:3000";
  }
}

export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.redirect(new URL("/", baseUrl()));
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.redirect(new URL("/?billing=stripe-missing", baseUrl()));
    }

    const priceId = await resolveOneTimePriceId("pro");
    if (!priceId) {
      return NextResponse.redirect(new URL("/?billing=no-price", baseUrl()));
    }

    if (!hasDatabaseConfig()) {
      return NextResponse.redirect(new URL("/?billing=no-database", baseUrl()));
    }

    let userRow = await getUserBillingByEmail(email);
    if (!userRow) {
      const ensured = await ensureUserRowByEmail(email);
      if (!ensured) {
        return NextResponse.redirect(new URL("/?billing=db-error", baseUrl()));
      }
      userRow = await getUserBillingByEmail(email);
    }
    if (!userRow) {
      return NextResponse.redirect(new URL("/?billing=no-user", baseUrl()));
    }

    if (userRow.plan_slug === "pro") {
      return NextResponse.redirect(new URL("/?billing=already-pro", baseUrl()));
    }

    let customerId = userRow.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userRow.id },
      });
      customerId = customer.id;
      await setStripeCustomerId(userRow.id, customerId);
    }

    const origin = baseUrl();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_types: ["promptpay", "card"],
      success_url: `${origin}/?billing=success`,
      cancel_url: `${origin}/?billing=cancel`,
      metadata: { user_id: userRow.id, product_slug: "pro_lifetime" },
      allow_promotion_codes: false,
    });

    if (!checkout.url) {
      return NextResponse.redirect(new URL("/?billing=no-url", baseUrl()));
    }
    return NextResponse.redirect(checkout.url);
  } catch (error) {
    logError("GET_api_billing_checkout", error);
    return NextResponse.redirect(new URL("/?billing=error", baseUrl()));
  }
}
