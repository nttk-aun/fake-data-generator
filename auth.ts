import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getUserBillingByEmail, upsertUserFromGoogle } from "@/lib/billing/users";
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

/** Public site URL for OAuth callbacks (Vercel sets VERCEL_URL without https). */
function resolveAuthUrl(): string | undefined {
  try {
    const explicit = (
      process.env.AUTH_URL ??
      process.env.NEXTAUTH_URL ??
      ""
    )
      .trim()
      .replace(/\/$/, "");
    if (explicit) {
      return explicit;
    }
    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) {
      return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
    }
    return undefined;
  } catch (error) {
    logError("resolveAuthUrl", error);
    return undefined;
  }
}

const resolvedAuthUrl = resolveAuthUrl();
if (resolvedAuthUrl && !process.env.AUTH_URL?.trim()) {
  process.env.AUTH_URL = resolvedAuthUrl;
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
  events: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider !== "google" || !user?.email) {
          return;
        }
        const p = profile as { sub?: string; email_verified?: boolean };
        const googleSub =
          (typeof p.sub === "string" && p.sub) ||
          account.providerAccountId ||
          "";
        await upsertUserFromGoogle({
          email: user.email,
          googleSub,
          name: user.name ?? null,
          imageUrl: user.image ?? null,
          emailVerified: Boolean(p.email_verified),
        });
      } catch (error) {
        logError("NextAuth_signIn_upsert", error);
      }
    },
  },
  callbacks: {
    async session({ session }) {
      try {
        const email = session.user?.email;
        if (email) {
          const row = await getUserBillingByEmail(email);
          if (row) {
            session.user.id = row.id;
            session.billing = {
              planSlug: row.plan_slug,
              maxBulkRows: row.max_bulk_rows,
              subscriptionStatus: row.subscription_status,
              subscriptionEndsAt:
                row.subscription_current_period_end?.toISOString() ?? null,
            };
          }
        }
      } catch (error) {
        logError("NextAuth_session_callback", error);
      }
      return session;
    },
  },
});
