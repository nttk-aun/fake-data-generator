import { buildRealisticEmailLocal, pickEmailDomain } from "@/lib/email-local";
import { mockApiKey, mockUuid } from "@/lib/ids";
import { formatPanGroups, generatePan16 } from "@/lib/luhn-card";
import { logError } from "@/lib/logger";
import type { GeneratedProfile } from "./types";
import {
  buildThailandSyntheticAddress,
  formatThailandSyntheticPhone,
  pickThailandCompany,
  pickThailandFirstName,
  pickThailandLastName,
  syntheticGeneratedAt,
} from "@/lib/generators/synthetic";

export function generateThailandProfile(): GeneratedProfile {
  try {
    const firstName = pickThailandFirstName();
    const lastName = pickThailandLastName();
    const fullName = `${firstName} ${lastName}`;
    const phone = formatThailandSyntheticPhone();
    const address = buildThailandSyntheticAddress();
    const domain = pickEmailDomain();
    const email = `${buildRealisticEmailLocal(firstName, lastName)}@${domain}`;
    const company = pickThailandCompany();

    /** Test-style Visa-ish BIN fragment; PAN is fictional + Luhn-valid. */
    const pan = generatePan16("424242424");
    const creditCard = formatPanGroups(pan);
    const creditCardMasked = `${pan.slice(0, 6)}••••••${pan.slice(-4)}`;

    return {
      country: "TH",
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
    logError("generateThailandProfile", error);
    return {
      country: "TH",
      firstName: "ทดสอบ",
      lastName: "สมมุติ",
      fullName: "ทดสอบ สมมุติ",
      phone: "070-000-0000",
      address: "เลขที่จำลอง 9397 ซอยตัวอย่าง\nเขตทดสอบ กรุงเทพมหานคร 00000",
      email: "test.user@example.com",
      company: "บริษัท ทดสอบ เทสดาต้า จำกัด",
      creditCard: formatPanGroups("4242424242424242"),
      creditCardMasked: "424242xxxxxx4242",
      uuid: mockUuid(),
      apiKeyMock: mockApiKey("sk_test_"),
      isSynthetic: true,
      generatedAt: syntheticGeneratedAt(),
    };
  }
}
