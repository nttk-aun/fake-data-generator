import { buildRealisticEmailLocal, pickEmailDomain } from "@/lib/email-local";
import { mockApiKey, mockUuid } from "@/lib/ids";
import { formatPanGroups, generatePan16 } from "@/lib/luhn-card";
import { logError } from "@/lib/logger";
import type { GeneratedProfile } from "./types";
import {
  buildUsSyntheticAddress,
  formatUsSyntheticPhone,
  pickUsCompany,
  pickUsFirstName,
  pickUsLastName,
  syntheticGeneratedAt,
} from "./synthetic";

export function generateUnitedStatesProfile(): GeneratedProfile {
  try {
    const firstName = pickUsFirstName();
    const lastName = pickUsLastName();
    const fullName = `${firstName} ${lastName}`;
    const phone = formatUsSyntheticPhone();
    const address = buildUsSyntheticAddress();
    const domain = pickEmailDomain();
    const email = `${buildRealisticEmailLocal(firstName, lastName)}@${domain}`;
    const company = pickUsCompany();

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
      firstName: "Test",
      lastName: "Alias",
      fullName: "Test Alias",
      phone: "(555) 010-0000",
      address: "Mock #9397 Sample Alley\nTest District, TS 00000",
      email: "test.user@example.com",
      company: "Test Testdata, Inc.",
      creditCard: formatPanGroups("5555555555554444"),
      creditCardMasked: "555555••••••4444",
      uuid: mockUuid(),
      apiKeyMock: mockApiKey("sk_test_"),
      isSynthetic: true,
      generatedAt: syntheticGeneratedAt(),
    };
  }
}
