import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { logError } from "@/lib/logger";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let cached: DbInstance | null = null;

export function getDb(): DbInstance {
  try {
    if (cached) {
      return cached;
    }
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(url);
    cached = drizzle(sql, { schema });
    return cached;
  } catch (error) {
    logError("getDb", error);
    throw error;
  }
}
