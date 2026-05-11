import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { signSessionToken, tryGetJwtSecretKey } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { safeParseLoginBody } from "@/lib/auth/validation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  try {
    return NextResponse.json({ ok: false, error: message }, { status });
  } catch (error) {
    logError("jsonError_login", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!tryGetJwtSecretKey()) {
      return jsonError("เซิร์ฟเวอร์ยังไม่ตั้งค่า AUTH_SECRET (อย่างน้อย 32 ตัว)", 503);
    }

    const raw = (await request.json()) as unknown;
    const parsed = safeParseLoginBody(raw);
    if (!parsed.success) {
      return jsonError("ข้อมูลไม่ถูกต้อง", 400);
    }

    const db = getDb();
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    const user = rows[0];
    if (!user) {
      return jsonError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return jsonError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
    }

    const token = await signSessionToken(user.id, user.email);
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
    logError("POST_api_auth_login", error);
    return jsonError("เซิร์ฟเวอร์ผิดพลาด", 500);
  }
}
