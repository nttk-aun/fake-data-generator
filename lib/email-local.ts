import type { Faker } from "@faker-js/faker";
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
      const parts = ascii.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const first = parts[0]!;
        const last = parts[parts.length - 1]!;
        const style = Math.floor(Math.random() * 3);
        if (style === 0) {
          return `${first[0]}${last}${randomDigits(1)}`;
        }
        if (style === 1) {
          return `${first}.${last}${randomDigits(2)}`;
        }
        return `${first}${last.slice(0, 1)}${randomDigits(2)}`;
      }
      return `${parts[0]}.${randomDigits(2)}`;
    }

    return `${fakerEn.internet.username()}${randomDigits(2)}`;
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

const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
] as const;

/** Mix of well-known providers + faker domains (readable, Mockaroo-style). */
export function pickRealisticEmailDomain(faker: Faker): string {
  try {
    if (Math.random() < 0.75) {
      const idx = Math.floor(Math.random() * COMMON_EMAIL_DOMAINS.length);
      return COMMON_EMAIL_DOMAINS[idx] ?? "gmail.com";
    }
    return faker.internet.domainName();
  } catch (error) {
    logError("pickRealisticEmailDomain", error);
    return "example.com";
  }
}

export function pickEmailDomain(): string {
  return pickRealisticEmailDomain(fakerEn);
}
