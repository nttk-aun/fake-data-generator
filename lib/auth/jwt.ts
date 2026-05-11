import * as jose from "jose";
import { AUTH_SECRET_MIN_LENGTH } from "@/lib/auth/constants";
import { logError } from "@/lib/logger";

export type SessionPayload = {
  userId: string;
  email: string;
};

export function tryGetJwtSecretKey(): Uint8Array | null {
  try {
    const raw = process.env.AUTH_SECRET ?? "";
    if (raw.length < AUTH_SECRET_MIN_LENGTH) {
      return null;
    }
    return new TextEncoder().encode(raw);
  } catch (error) {
    logError("tryGetJwtSecretKey", error);
    return null;
  }
}

function requireJwtSecretKey(): Uint8Array {
  try {
    const key = tryGetJwtSecretKey();
    if (!key) {
      throw new Error("AUTH_SECRET missing or too short (min 32 chars)");
    }
    return key;
  } catch (error) {
    logError("requireJwtSecretKey", error);
    throw error;
  }
}

export async function signSessionToken(
  userId: string,
  email: string,
): Promise<string> {
  try {
    const secret = requireJwtSecretKey();
    const token = await new jose.SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);
    return token;
  } catch (error) {
    logError("signSessionToken", error);
    throw error;
  }
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const secret = tryGetJwtSecretKey();
    if (!secret) {
      return null;
    }
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    const email =
      typeof payload.email === "string" ? payload.email : "";
    if (!userId || !email) {
      return null;
    }
    return { userId, email };
  } catch (error) {
    logError("verifySessionToken", error);
    return null;
  }
}
