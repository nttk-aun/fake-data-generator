import { auth } from "@/auth";
import {
  getPlanStripePriceMonthly,
  getUserBillingByEmail,
  setStripeCustomerId,
} from "@/lib/billing/users";
import { getStripe } from "@/lib/billing/stripe-client";
import { logError } from "@/lib/logger";
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

    const fromEnv = process.env.STRIPE_PRICE_ID_MONTHLY?.trim() ?? "";
    const fromDb = (await getPlanStripePriceMonthly("pro"))?.trim() ?? "";
    const rawPriceId = fromEnv || fromDb;
    // Stripe Checkout ต้องการ Price ID (price_...) ไม่ใช่ Product ID (prod_...)
    const priceId =
      rawPriceId && !rawPriceId.startsWith("prod_") ? rawPriceId : "";
    if (!priceId) {
      return NextResponse.redirect(new URL("/?billing=no-price", baseUrl()));
    }

    const userRow = await getUserBillingByEmail(email);
    if (!userRow) {
      return NextResponse.redirect(new URL("/?billing=no-user", baseUrl()));
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
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?billing=success`,
      cancel_url: `${origin}/?billing=cancel`,
      metadata: { user_id: userRow.id },
      subscription_data: {
        metadata: { user_id: userRow.id },
      },
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
