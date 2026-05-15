import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { logError } from "@/lib/logger";

let sqlInstance: NeonQueryFunction<false, false> | null = null;

/** Vercel + Neon integration may expose POSTGRES_URL instead of DATABASE_URL. */
const DATABASE_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "NEON_DATABASE_URL",
] as const;

export function readDatabaseUrl(): string | null {
  try {
    for (const key of DATABASE_ENV_KEYS) {
      const url = process.env[key]?.trim();
      if (url) {
        return url;
      }
    }
    return null;
  } catch (error) {
    logError("readDatabaseUrl", error);
    return null;
  }
}

export function hasDatabaseConfig(): boolean {
  return readDatabaseUrl() !== null;
}

export function getSql(): NeonQueryFunction<false, false> | null {
  try {
    if (sqlInstance) {
      return sqlInstance;
    }
    const url = readDatabaseUrl();
    if (!url) {
      return null;
    }
    sqlInstance = neon(url);
    return sqlInstance;
  } catch (error) {
    logError("getSql", error);
    return null;
  }
}
