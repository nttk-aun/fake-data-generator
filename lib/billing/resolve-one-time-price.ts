import {
  getPlanStripePriceOneTime,
} from "@/lib/billing/users";
import { logError } from "@/lib/logger";

/** Stripe Price ID สำหรับ Checkout ครั้งเดียว (PromptPay) — ต้องเป็น price_ แบบ one-time THB */
export async function resolveOneTimePriceId(
  planSlug = "pro",
): Promise<string> {
  try {
    const fromEnv = process.env.STRIPE_PRICE_ID_ONE_TIME?.trim() ?? "";
    const fromDb = (await getPlanStripePriceOneTime(planSlug))?.trim() ?? "";
    const raw = fromEnv || fromDb;
    if (!raw || raw.startsWith("prod_")) {
      return "";
    }
    return raw;
  } catch (error) {
    logError("resolveOneTimePriceId", error);
    return "";
  }
}
