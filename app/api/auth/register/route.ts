import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { signSessionToken, tryGetJwtSecretKey } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { safeParseRegisterBody } from "@/lib/auth/validation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  try {
    return NextResponse.json({ ok: false, error: message }, { status });
  } catch (error) {
    logError("jsonError", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!tryGetJwtSecretKey()) {
      return jsonError("เซิร์ฟเวอร์ยังไม่ตั้งค่า AUTH_SECRET (อย่างน้อย 32 ตัว)", 503);
    }

    const raw = (await request.json()) as unknown;
    const parsed = safeParseRegisterBody(raw);
    if (!parsed.success) {
      return jsonError("ข้อมูลไม่ถูกต้อง (อีเมลหรือรหัสผ่าน)", 400);
    }

    const db = getDb();
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (existing.length > 0) {
      return jsonError("อีเมลนี้ถูกใช้แล้ว", 409);
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const [created] = await db
      .insert(users)
      .values({
        email: parsed.data.email,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email });

    if (!created) {
      return jsonError("สร้างบัญชีไม่สำเร็จ", 500);
    }

    const token = await signSessionToken(created.id, created.email);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (error) {
    logError("POST_api_auth_register", error);
    return jsonError("เซิร์ฟเวอร์ผิดพลาด", 500);
  }
}
