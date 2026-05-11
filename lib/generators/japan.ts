import { faker as fakerJa } from "@faker-js/faker/locale/ja";
import { buildRealisticEmailLocal, pickEmailDomain } from "@/lib/email-local";
import { mockApiKey, mockUuid } from "@/lib/ids";
import { formatPanGroups, generatePan16 } from "@/lib/luhn-card";
import { logError } from "@/lib/logger";
import { randomPick } from "@/lib/random-utils";
import type { GeneratedProfile } from "./types";

const JP_PREFECTURE_ZIP: [string, string][] = [
  ["東京都", "150-0002"],
  ["東京都", "104-0061"],
  ["大阪府", "530-0001"],
  ["福岡県", "810-0001"],
  ["北海道", "060-0004"],
  ["京都府", "604-8005"],
];

export function generateJapanProfile(): GeneratedProfile {
  try {
    const firstName = fakerJa.person.firstName();
    const lastName = fakerJa.person.lastName();
    const fullName = `${lastName} ${firstName}`;

    let phone = fakerJa.phone.number();
    if ((phone.match(/\d/g)?.length ?? 0) < 10) {
      phone = `090-${fakerJa.string.numeric(4)}-${fakerJa.string.numeric(4)}`;
    }

    const city = fakerJa.location.city();
    const street = fakerJa.location.street();
    const banchi = fakerJa.location.buildingNumber();
    const place = randomPick(JP_PREFECTURE_ZIP) ?? ["東京都", "150-0002"];
    const [prefecture, postalCode] = place;
    const address = `〒${postalCode}\n${prefecture}${city}${street}${banchi}`;

    const domain = pickEmailDomain();
    const email = `${buildRealisticEmailLocal(firstName, lastName)}@${domain}`;
    const company = fakerJa.company.name();

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
    };
  } catch (error) {
    logError("generateJapanProfile", error);
    return {
      country: "JP",
      firstName: "太郎",
      lastName: "山田",
      fullName: "山田 太郎",
      phone: "090-1234-5678",
      address: "〒150-0002\n東京都渋谷区1-2-3",
      email: "taro.yamada@example.com",
      company: "株式会社サンプル",
      creditCard: formatPanGroups("3566111111111113"),
      creditCardMasked: "356611••••••1113",
      uuid: mockUuid(),
      apiKeyMock: mockApiKey("sk_test_"),
    };
  }
}
