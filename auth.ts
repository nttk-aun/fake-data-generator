import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { logError } from "@/lib/logger";

function readGoogleClientId(): string {
  try {
    return (
      process.env.AUTH_GOOGLE_ID ??
      process.env.GOOGLE_CLIENT_ID ??
      ""
    ).trim();
  } catch (error) {
    logError("readGoogleClientId", error);
    return "";
  }
}

function readGoogleClientSecret(): string {
  try {
    return (
      process.env.AUTH_GOOGLE_SECRET ??
      process.env.GOOGLE_CLIENT_SECRET ??
      ""
    ).trim();
  } catch (error) {
    logError("readGoogleClientSecret", error);
    return "";
  }
}

/** Auth.js requires `secret` (≥32 chars). Set `AUTH_SECRET` in .env; dev fallback for non-production only. */
function readAuthSecret(): string {
  try {
    const fromEnv = (
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET ??
      ""
    ).trim();
    if (fromEnv.length >= 32) {
      return fromEnv;
    }
    if (process.env.NODE_ENV !== "production") {
      return "0123456789abcdef0123456789abcdef";
    }
    throw new Error("AUTH_SECRET is required in production (min 32 characters).");
  } catch (error) {
    logError("readAuthSecret", error);
    if (process.env.NODE_ENV !== "production") {
      return "0123456789abcdef0123456789abcdef";
    }
    throw error;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: readAuthSecret(),
  providers: [
    Google({
      clientId: readGoogleClientId(),
      clientSecret: readGoogleClientSecret(),
    }),
  ],
});
