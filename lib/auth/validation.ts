import { z } from "zod";
import { logError } from "@/lib/logger";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("invalid_email")
  .max(256);

const passwordField = z.string().min(8, "password_too_short").max(128);

export const registerBodySchema = z.object({
  email: emailField,
  password: passwordField,
});

export const loginBodySchema = z.object({
  email: emailField,
  password: z.string().min(1).max(128),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;

export function safeParseRegisterBody(
  data: unknown,
): z.SafeParseReturnType<unknown, RegisterBody> {
  try {
    return registerBodySchema.safeParse(data);
  } catch (error) {
    logError("safeParseRegisterBody", error);
    return registerBodySchema.safeParse({});
  }
}

export function safeParseLoginBody(
  data: unknown,
): z.SafeParseReturnType<unknown, LoginBody> {
  try {
    return loginBodySchema.safeParse(data);
  } catch (error) {
    logError("safeParseLoginBody", error);
    return loginBodySchema.safeParse({});
  }
}
