-- =============================================================================
-- Neon / PostgreSQL — สมาชิก + Google identity + Stripe (subscription / one-time)
-- รันใน Neon SQL Editor หรือ psql ทั้งไฟล์
-- =============================================================================

-- gen_random_uuid() มีใน PostgreSQL 13+ (Neon รองรับ)
-- ถ้าโปรเจกต์เก่ามากไม่มี ให้ uncomment บรรทัดถัดไป:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- แผนราคา (อ้างอิงจาก Stripe Price ID — แก้ค่า price_... หลังสร้างใน Stripe)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
  slug text PRIMARY KEY,
  display_name text NOT NULL,
  max_bulk_rows integer NOT NULL CHECK (max_bulk_rows > 0),
  stripe_price_id_monthly text NULL,
  stripe_price_id_one_time text NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE plans IS 'แผนราคา: ใช้ max_bulk_rows เป็นขีดบน server ตอน export';

-- ค่าเริ่มต้น (แก้ stripe_price_* เมื่อมี Product ใน Stripe แล้ว)
INSERT INTO plans (slug, display_name, max_bulk_rows, stripe_price_id_monthly, stripe_price_id_one_time, sort_order)
VALUES
  ('free', 'Free', 100, NULL, NULL, 0),
  ('pro', 'Pro (ตัวอย่าง)', 10000, NULL, NULL, 10)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- ผู้ใช้ — ผูก Google + Stripe + สิทธิ์ export (snapshot จาก webhook / login)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  email varchar(320) NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  name text NULL,
  image_url text NULL,

  -- จาก Google OIDC "sub" (ไม่ซ้ำต่อ provider)
  google_sub text NULL UNIQUE,

  stripe_customer_id text NULL UNIQUE,

  -- แผนปัจจุบัน (อ้าง plans.slug) — อัปเดตจาก webhook
  plan_slug text NOT NULL DEFAULT 'free' REFERENCES plans (slug) ON UPDATE CASCADE,

  -- ขีดบนแถวต่อการ export หนึ่งครั้ง (ควร sync กับ plans หรือ override พิเศษ)
  max_bulk_rows integer NOT NULL DEFAULT 100 CHECK (max_bulk_rows > 0),

  -- สถานะ subscription ล่าสุด (สรุปจาก Stripe)
  subscription_status text NOT NULL DEFAULT 'none',
  -- none | active | trialing | past_due | canceled | unpaid | incomplete | ...

  subscription_current_period_end timestamptz NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_plan ON users (plan_slug);

COMMENT ON COLUMN users.google_sub IS 'Google OIDC subject; ใช้ upsert ผู้ใช้หลังล็อกอิน';
COMMENT ON COLUMN users.max_bulk_rows IS 'ใช้ clamp จำนวนแถวบน API — อย่าเชื่อถือค่าจาก client อย่างเดียว';
COMMENT ON COLUMN users.subscription_status IS 'สรุปจาก Stripe subscription ล่าสุด';

-- -----------------------------------------------------------------------------
-- Subscription หนึ่งแถวต่อ stripe_subscription_id (ประวัติหลายแถวได้ถ้าต้องการ audit)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,

  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_price_id text NULL,

  status text NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,

  current_period_start timestamptz NULL,
  current_period_end timestamptz NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

-- -----------------------------------------------------------------------------
-- Webhook idempotency — กันประมวลผล event เดิมซ้ำ
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  livemode boolean NOT NULL DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type ON stripe_webhook_events (event_type);

-- -----------------------------------------------------------------------------
-- ซื้อแบบครั้งเดียว (เช่น แพ็กแถว) — ยืนยันหลัง checkout / payment_intent succeeded
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES users (id) ON DELETE SET NULL,

  stripe_checkout_session_id text NULL UNIQUE,
  stripe_payment_intent_id text NULL,

  product_slug text NOT NULL,
  rows_purchased integer NULL CHECK (rows_purchased IS NULL OR rows_purchased > 0),

  amount_cents integer NULL,
  currency text NULL DEFAULT 'thb',

  fulfilled_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases (user_id);

-- -----------------------------------------------------------------------------
-- updated_at อัตโนมัติ
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_updated_at();

-- ถ้า Postgres รายงานว่าไม่รู้จัก EXECUTE FUNCTION ให้เปลี่ยนทั้งสอง trigger เป็น:
-- EXECUTE PROCEDURE trg_set_updated_at();
