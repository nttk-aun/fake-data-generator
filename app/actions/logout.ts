"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { logError } from "@/lib/logger";

export async function logoutAction() {
  try {
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    logError("logoutAction", error);
  }
  redirect("/login");
}
