import Stripe from "stripe";
import { logError } from "@/lib/logger";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  try {
    if (stripe) {
      return stripe;
    }
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      return null;
    }
    stripe = new Stripe(key);
    return stripe;
  } catch (error) {
    logError("getStripe", error);
    return null;
  }
}
