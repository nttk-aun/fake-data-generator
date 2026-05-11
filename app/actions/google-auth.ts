"use server";

import { signIn, signOut } from "@/auth";
import { logError } from "@/lib/logger";

export async function signInWithGoogleAction() {
  try {
    await signIn("google", { redirectTo: "/" });
  } catch (error) {
    logError("signInWithGoogleAction", error);
    throw error;
  }
}

export async function signOutAction() {
  try {
    await signOut({ redirectTo: "/" });
  } catch (error) {
    logError("signOutAction", error);
    throw error;
  }
}
