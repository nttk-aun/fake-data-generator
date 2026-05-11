import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { logError } from "@/lib/logger";

let sqlInstance: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> | null {
  try {
    if (sqlInstance) {
      return sqlInstance;
    }
    const url = process.env.DATABASE_URL?.trim();
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
