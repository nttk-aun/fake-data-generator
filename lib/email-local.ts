import { faker as fakerEn } from "@faker-js/faker/locale/en";
import { logError } from "./logger";
import { randomDigits } from "./random-utils";

export function buildRealisticEmailLocal(firstName: string, lastName: string): string {
  try {
    const combined = `${firstName} ${lastName}`.trim();
    const ascii = combined
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .replace(/[^\w\s.]/gu, "")
      .trim()
      .toLowerCase();

    if (ascii.length >= 3) {
      const compact = ascii.replace(/\s+/g, ".");
      return `${compact}.${randomDigits(2)}`;
    }

    return `${fakerEn.internet.username()}.${randomDigits(3)}`;
  } catch (error) {
    logError("buildRealisticEmailLocal", error);
    try {
      return `${fakerEn.internet.username()}.${randomDigits(3)}`;
    } catch (err2) {
      logError("buildRealisticEmailLocal_fallback", err2);
      return `user.${randomDigits(6)}`;
    }
  }
}

export function pickEmailDomain(): string {
  try {
    const domains = [
      "example.com",
      "example.net",
      "mail.example",
      "inbox.dev",
      "mailbox.test",
      "noreply.dev",
      "staging-mail.test",
    ] as const;
    const idx = Math.floor(Math.random() * domains.length);
    return domains[idx] ?? domains[0];
  } catch (error) {
    logError("pickEmailDomain", error);
    return "example.com";
  }
}
