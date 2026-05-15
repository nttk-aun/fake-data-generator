import { faker as fakerEn } from "@faker-js/faker/locale/en";
import { mockApiKey, mockUuid } from "@/lib/ids";
import { formatPanGroups, generatePan16 } from "@/lib/luhn-card";
import { logError } from "@/lib/logger";
import type { GeneratedProfile } from "./types";
import { pickRealisticEmail, syntheticGeneratedAt } from "./profile-meta";

export function generateUnitedStatesProfile(): GeneratedProfile {
  try {
    const firstName = fakerEn.person.firstName();
    const lastName = fakerEn.person.lastName();
    const fullName = fakerEn.person.fullName({ firstName, lastName });
    const phone = fakerEn.phone.number({ style: "national" });
    const secondary = fakerEn.location.secondaryAddress();
    const addr = fakerEn.location.streetAddress();
    const city = fakerEn.location.city();
    const stateAbbr = fakerEn.location.state({ abbreviated: true });
    const zip = fakerEn.location.zipCode();
    const address = `${addr}\n${secondary ? `${secondary}\n` : ""}${city}, ${stateAbbr} ${zip}`;
    const email = pickRealisticEmail(firstName, lastName, fakerEn);
    const company = fakerEn.company.name();

    const pan = generatePan16("555555555");
    const creditCard = formatPanGroups(pan);
    const creditCardMasked = `${pan.slice(0, 6)}••••••${pan.slice(-4)}`;

    return {
      country: "US",
      firstName,
      lastName,
      fullName,
      phone,
      address,
      email,
      company,
      creditCard,
      creditCardMasked,
      uuid: mockUuid(),
      apiKeyMock: mockApiKey("sk_test_"),
      isSynthetic: true,
      generatedAt: syntheticGeneratedAt(),
    };
  } catch (error) {
    logError("generateUnitedStatesProfile", error);
    return {
      country: "US",
      firstName: "Alex",
      lastName: "Sample",
      fullName: "Alex Sample",
      phone: "(555) 010-0199",
      address: "123 Market St\nSan Francisco, CA 94105",
      email: "alex.sample@example.com",
      company: "Sample Co., Inc.",
      creditCard: formatPanGroups("5555555555554444"),
      creditCardMasked: "555555••••••4444",
      uuid: mockUuid(),
      apiKeyMock: mockApiKey("sk_test_"),
      isSynthetic: true,
      generatedAt: syntheticGeneratedAt(),
    };
  }
}
