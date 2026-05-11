import bcrypt from "bcryptjs";
import { logError } from "@/lib/logger";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  try {
    return await bcrypt.hash(plain, SALT_ROUNDS);
  } catch (error) {
    logError("hashPassword", error);
    throw error;
  }
}

export async function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, passwordHash);
  } catch (error) {
    logError("verifyPassword", error);
    return false;
  }
}
