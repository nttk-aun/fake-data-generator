"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/auth";
import { logError } from "@/lib/logger";

export async function signInWithGoogleAction() {
  try {
    await signIn("google", { redirectTo: "/" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    logError("signInWithGoogleAction", error);
    throw error;
  }
}

export async function signOutAction() {
  try {
    await signOut({ redirectTo: "/" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    logError("signOutAction", error);
    throw error;
  }
}
