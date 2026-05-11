-- หลังสร้าง Product + Price ใน Stripe (รายเดือน $1 USD) ให้แก้ price_... แล้วรันบรรทัด UPDATE นี้ใน Neon
-- Stripe Dashboard: Products → Add product → Price recurring monthly $1 → copy Price ID

UPDATE plans
SET
  display_name = 'Pro ($1/mo)',
  max_bulk_rows = 50000,
  stripe_price_id_monthly = 'price_REPLACE_WITH_YOUR_STRIPE_PRICE_ID'
WHERE slug = 'pro';

-- ถ้าต้องการให้ free จำกัดแถวน้อยลง:
-- UPDATE plans SET max_bulk_rows = 50 WHERE slug = 'free';
