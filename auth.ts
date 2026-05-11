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

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: readGoogleClientId(),
      clientSecret: readGoogleClientSecret(),
    }),
  ],
});
