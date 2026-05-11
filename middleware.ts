import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { tryGetJwtSecretKey } from "@/lib/auth/jwt";
import { logError } from "@/lib/logger";

async function isTokenValid(token: string | undefined): Promise<boolean> {
  try {
    if (!token) {
      return false;
    }
    const key = tryGetJwtSecretKey();
    if (!key) {
      return false;
    }
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const ok = await isTokenValid(token);

    if (pathname === "/login" || pathname === "/register") {
      if (ok) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    if (pathname === "/") {
      if (!ok) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    logError("middleware", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/", "/login", "/register"],
};
