"use client";

import { useSearchParams } from "next/navigation";
import { logError } from "@/lib/logger";

function billingMessage(code: string | null): string | null {
  try {
    if (!code) {
      return null;
    }
    const map: Record<string, string> = {
      success: "ชำระเงินสำเร็จ — ถ้าแผนยังไม่เป็น Pro ให้รอสักครู่แล้วรีเฟรช (webhook อาจใช้เวลาไม่กี่วินาที)",
      cancel: "ยกเลิกการชำระเงิน",
      "stripe-missing":
        "ยังไม่ได้ตั้ง STRIPE_SECRET_KEY ใน environment — ใส่คีย์ sk_test_... แล้ว restart เซิร์ฟเวอร์",
      "no-price":
        "ไม่พบ Stripe Price — ตั้ง STRIPE_PRICE_ID_MONTHLY=price_... หรือใส่ราคาใน Neon ตาราง plans (pro)",
      "no-user":
        "ไม่พบบัญชีในระบบ — ลองออกจากระบบแล้วล็อกอินใหม่ หรือตรวจว่า DATABASE_URL ต่อ Neon ได้",
      "no-url": "Stripe ไม่คืนลิงก์ Checkout — ตรวจ Price / บัญชี Stripe ในโหมด test",
      error: "เกิดข้อผิดพลาดตอนสร้าง Checkout — ดู log ที่เทอร์มินัลหรือ Vercel Logs",
    };
    return map[code] ?? `สถานะชำระเงิน: ${code}`;
  } catch (error) {
    logError("billingMessage", error);
    return null;
  }
}

export function BillingAlert() {
  try {
    const searchParams = useSearchParams();
    const code = searchParams.get("billing");
    const message = billingMessage(code);
    if (!message) {
      return null;
    }

    const isOk = code === "success";
    return (
      <div
        className={`mx-auto w-full max-w-2xl px-4 pt-4 ${
          isOk
            ? "text-emerald-800 dark:text-emerald-200"
            : "text-amber-900 dark:text-amber-200"
        }`}
        role="status"
      >
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            isOk
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50"
              : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30"
          }`}
        >
          {message}
        </div>
      </div>
    );
  } catch (error) {
    logError("BillingAlert", error);
    return null;
  }
}
