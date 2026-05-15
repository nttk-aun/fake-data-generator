import { buildRealisticEmailLocal, pickEmailDomain } from "@/lib/email-local";
import { mockApiKey, mockUuid } from "@/lib/ids";
import { formatPanGroups, generatePan16 } from "@/lib/luhn-card";
import { logError } from "@/lib/logger";
import type { GeneratedProfile } from "./types";
import {
  buildJapanSyntheticAddress,
  formatJapanSyntheticPhone,
  pickJapanCompany,
  pickJapanFirstName,
  pickJapanLastName,
  syntheticGeneratedAt,
} from "./synthetic";

export function generateJapanProfile(): GeneratedProfile {
  try {
    const firstName = pickJapanFirstName();
    const lastName = pickJapanLastName();
    const fullName = `${lastName} ${firstName}`;
    const phone = formatJapanSyntheticPhone();
    const address = buildJapanSyntheticAddress();
    const domain = pickEmailDomain();
    const email = `${buildRealisticEmailLocal(firstName, lastName)}@${domain}`;
    const company = pickJapanCompany();

    const pan = generatePan16("356611111");
    const creditCard = formatPanGroups(pan);
    const creditCardMasked = `${pan.slice(0, 6)}••••••${pan.slice(-4)}`;

    return {
      country: "JP",
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
    logError("generateJapanProfile", error);
    return {
      country: "JP",
      firstName: "テスト",
      lastName: "エイリアス",
      fullName: "エイリアス テスト",
      phone: "099-0000-0000",
      address: "〒000-0000\n架空番地9397 サンプル町\nテスト区 東京都 000-0000",
      email: "test.user@example.com",
      company: "株式会社テストデータ",
      creditCard: formatPanGroups("3566111111111113"),
      creditCardMasked: "356611••••••1113",
      uuid: mockUuid(),
      apiKeyMock: mockApiKey("sk_test_"),
      isSynthetic: true,
      generatedAt: syntheticGeneratedAt(),
    };
  }
}
