import { getSql } from "@/lib/neon";
import { logError } from "@/lib/logger";

export type UserBillingRow = {
  id: string;
  email: string;
  google_sub: string | null;
  stripe_customer_id: string | null;
  plan_slug: string;
  max_bulk_rows: number;
  subscription_status: string;
  subscription_current_period_end: Date | null;
};

export async function upsertUserFromGoogle(opts: {
  email: string;
  googleSub: string;
  name: string | null;
  imageUrl: string | null;
  emailVerified: boolean;
}): Promise<void> {
  const sql = getSql();
  if (!sql) {
    return;
  }
  try {
    await sql`
      INSERT INTO users (email, google_sub, name, image_url, email_verified)
      VALUES (
        ${opts.email},
        ${opts.googleSub},
        ${opts.name},
        ${opts.imageUrl},
        ${opts.emailVerified}
      )
      ON CONFLICT (email) DO UPDATE SET
        google_sub = COALESCE(EXCLUDED.google_sub, users.google_sub),
        name = COALESCE(EXCLUDED.name, users.name),
        image_url = COALESCE(EXCLUDED.image_url, users.image_url),
        email_verified = EXCLUDED.email_verified,
        updated_at = now()
    `;
  } catch (error) {
    logError("upsertUserFromGoogle", error);
  }
}

/** ถ้ามี session จาก Google แต่ยังไม่มีแถวใน DB (เช่น upsert ตอน login พลาด) — สร้างแถวขั้นต่ำ */
export async function ensureUserRowByEmail(email: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    return false;
  }
  try {
    await sql`
      INSERT INTO users (email, email_verified)
      VALUES (${email}, true)
      ON CONFLICT (email) DO NOTHING
    `;
    return true;
  } catch (error) {
    logError("ensureUserRowByEmail", error);
    return false;
  }
}

export async function getUserBillingByEmail(
  email: string,
): Promise<UserBillingRow | null> {
  const sql = getSql();
  if (!sql) {
    return null;
  }
  try {
    const rows = (await sql`
      SELECT
        id::text,
        email,
        google_sub,
        stripe_customer_id,
        plan_slug,
        max_bulk_rows,
        subscription_status,
        subscription_current_period_end
      FROM users
      WHERE lower(email) = lower(${email})
      LIMIT 1
    `) as UserBillingRow[];
    return rows[0] ?? null;
  } catch (error) {
    logError("getUserBillingByEmail", error);
    return null;
  }
}

export async function setStripeCustomerId(
  userId: string,
  stripeCustomerId: string,
): Promise<void> {
  const sql = getSql();
  if (!sql) {
    return;
  }
  try {
    await sql`
      UPDATE users
      SET stripe_customer_id = ${stripeCustomerId}, updated_at = now()
      WHERE id = ${userId}
    `;
  } catch (error) {
    logError("setStripeCustomerId", error);
  }
}

export async function getPlanStripePriceMonthly(
  planSlug: string,
): Promise<string | null> {
  const sql = getSql();
  if (!sql) {
    return null;
  }
  try {
    const rows = (await sql`
      SELECT stripe_price_id_monthly FROM plans WHERE slug = ${planSlug} LIMIT 1
    `) as { stripe_price_id_monthly: string | null }[];
    return rows[0]?.stripe_price_id_monthly ?? null;
  } catch (error) {
    logError("getPlanStripePriceMonthly", error);
    return null;
  }
}

export async function getPlanMaxBulkRows(planSlug: string): Promise<number> {
  const sql = getSql();
  if (!sql) {
    return 100;
  }
  try {
    const rows = (await sql`
      SELECT max_bulk_rows FROM plans WHERE slug = ${planSlug} LIMIT 1
    `) as { max_bulk_rows: number }[];
    const n = rows[0]?.max_bulk_rows;
    return typeof n === "number" && n > 0 ? n : 100;
  } catch (error) {
    logError("getPlanMaxBulkRows", error);
    return 100;
  }
}

export async function applyActiveSubscription(opts: {
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string | null;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  planSlug: string;
}): Promise<void> {
  const sql = getSql();
  if (!sql) {
    return;
  }
  try {
    const maxRows = await getPlanMaxBulkRows(opts.planSlug);
    await sql`
      INSERT INTO subscriptions (
        user_id, stripe_subscription_id, stripe_price_id, status,
        cancel_at_period_end, current_period_start, current_period_end
      )
      VALUES (
        ${opts.userId},
        ${opts.stripeSubscriptionId},
        ${opts.stripePriceId},
        ${opts.status},
        ${opts.cancelAtPeriodEnd},
        ${opts.currentPeriodStart},
        ${opts.currentPeriodEnd}
      )
      ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        stripe_price_id = EXCLUDED.stripe_price_id,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = now()
    `;
    await sql`
      UPDATE users SET
        plan_slug = ${opts.planSlug},
        max_bulk_rows = ${maxRows},
        subscription_status = ${opts.status},
        subscription_current_period_end = ${opts.currentPeriodEnd},
        updated_at = now()
      WHERE id = ${opts.userId}
    `;
  } catch (error) {
    logError("applyActiveSubscription", error);
  }
}

export async function downgradeUserToFree(userId: string): Promise<void> {
  const sql = getSql();
  if (!sql) {
    return;
  }
  try {
    const maxRows = await getPlanMaxBulkRows("free");
    await sql`
      UPDATE users SET
        plan_slug = 'free',
        max_bulk_rows = ${maxRows},
        subscription_status = 'none',
        subscription_current_period_end = NULL,
        updated_at = now()
      WHERE id = ${userId}
    `;
  } catch (error) {
    logError("downgradeUserToFree", error);
  }
}

export async function findUserIdByStripeCustomerId(
  customerId: string,
): Promise<string | null> {
  const sql = getSql();
  if (!sql) {
    return null;
  }
  try {
    const rows = (await sql`
      SELECT id::text FROM users WHERE stripe_customer_id = ${customerId} LIMIT 1
    `) as { id: string }[];
    return rows[0]?.id ?? null;
  } catch (error) {
    logError("findUserIdByStripeCustomerId", error);
    return null;
  }
}
