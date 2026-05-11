import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { type SessionPayload, verifySessionToken } from "@/lib/auth/jwt";
import { logError } from "@/lib/logger";

export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return null;
    }
    return await verifySessionToken(token);
  } catch (error) {
    logError("getServerSession", error);
    return null;
  }
}
