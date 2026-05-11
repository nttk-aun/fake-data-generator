import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
    };
    billing?: {
      planSlug: string;
      maxBulkRows: number;
      subscriptionStatus: string;
      subscriptionEndsAt: string | null;
    };
  }
}
