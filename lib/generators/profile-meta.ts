import type { Faker } from "@faker-js/faker";
import {
  buildRealisticEmailLocal,
  pickRealisticEmailDomain,
} from "@/lib/email-local";
import { logError } from "@/lib/logger";

export function syntheticGeneratedAt(): string {
  return new Date().toISOString();
}

/**
 * Readable email: latin local-part + common domain.
 * Avoids faker.internet.email({ firstName, lastName }) which mangles Thai/Japanese names.
 */
export function pickRealisticEmail(
  firstName: string,
  lastName: string,
  faker: Faker,
): string {
  try {
    const local = buildRealisticEmailLocal(firstName, lastName);
    const domain = pickRealisticEmailDomain(faker);
    return `${local}@${domain}`;
  } catch (error) {
    logError("pickRealisticEmail", error);
    return `${buildRealisticEmailLocal(firstName, lastName)}@example.com`;
  }
}
