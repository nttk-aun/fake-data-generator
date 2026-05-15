import { faker as fakerEn } from "@faker-js/faker/locale/en";
import { faker as fakerJa } from "@faker-js/faker/locale/ja";
import { faker as fakerTh } from "@faker-js/faker/locale/th";
import { logError } from "@/lib/logger";
import { randomDigits, randomPick } from "@/lib/random-utils";

/** นามสกุลสมมุติ — ไม่ใช้นามสกุลจริงจากทะเบียนราษฎร์ */
const TH_FICTIONAL_LAST_NAMES = [
  "สมมุติ",
  "จำลอง",
  "ทดสอบ",
  "ตัวอย่าง",
  "เทสดาต้า",
] as const;

/** Fictional surnames — Alias-style labels only */
const US_FICTIONAL_LAST_NAMES = ["Alias", "Sample", "Mock", "Fixture", "Testdata"] as const;

/** 架空の姓 — エイリアス系のみ */
const JP_FICTIONAL_LAST_NAMES = ["エイリアス", "サンプル", "テスト", "モック", "サンプルデータ"] as const;

const TH_COMPANY = "บริษัท ทดสอบ เทสดาต้า จำกัด";
const US_COMPANY = "Test Testdata, Inc.";
const JP_COMPANY = "株式会社テストデータ";

export function syntheticGeneratedAt(): string {
  return new Date().toISOString();
}

export function pickThailandFirstName(): string {
  try {
    return fakerTh.person.firstName();
  } catch (error) {
    logError("pickThailandFirstName", error);
    return "ทดสอบ";
  }
}

export function pickThailandLastName(): string {
  return randomPick(TH_FICTIONAL_LAST_NAMES) ?? "สมมุติ";
}

export function pickUsFirstName(): string {
  try {
    return fakerEn.person.firstName();
  } catch (error) {
    logError("pickUsFirstName", error);
    return "Test";
  }
}

export function pickUsLastName(): string {
  return randomPick(US_FICTIONAL_LAST_NAMES) ?? "Alias";
}

export function pickJapanFirstName(): string {
  try {
    return fakerJa.person.firstName();
  } catch (error) {
    logError("pickJapanFirstName", error);
    return "テスト";
  }
}

export function pickJapanLastName(): string {
  return randomPick(JP_FICTIONAL_LAST_NAMES) ?? "エイリアス";
}

export function pickThailandCompany(): string {
  return TH_COMPANY;
}

export function pickUsCompany(): string {
  return US_COMPANY;
}

export function pickJapanCompany(): string {
  return JP_COMPANY;
}

/** Thailand: 07x — prefix not allocated for real mobile (06/08/09 only). */
export function formatThailandSyntheticPhone(): string {
  try {
    const third = randomDigits(1);
    const mid = randomDigits(3);
    const tail = randomDigits(4);
    return `07${third}-${mid}-${tail}`;
  } catch (error) {
    logError("formatThailandSyntheticPhone", error);
    return "070-000-0000";
  }
}

/** US: 555-010-xxxx — NANP reserved for fiction/testing. */
export function formatUsSyntheticPhone(): string {
  try {
    const line = randomDigits(4);
    return `(555) 010-${line}`;
  } catch (error) {
    logError("formatUsSyntheticPhone", error);
    return "(555) 010-0000";
  }
}

/** Japan: 099 — not used for mobile (070/080/090/050 are real). */
export function formatJapanSyntheticPhone(): string {
  try {
    const mid = randomDigits(4);
    const tail = randomDigits(4);
    return `099-${mid}-${tail}`;
  } catch (error) {
    logError("formatJapanSyntheticPhone", error);
    return "099-0000-0000";
  }
}

function randomSyntheticHouseNum(min: number, max: number): number {
  try {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } catch (error) {
    logError("randomSyntheticHouseNum", error);
    return min;
  }
}

export function buildThailandSyntheticAddress(): string {
  try {
    const houseNum = randomSyntheticHouseNum(1000, 9999);
    const line1 = `เลขที่จำลอง ${houseNum} ซอยตัวอย่าง`;
    const line2 = "เขตทดสอบ กรุงเทพมหานคร 00000";
    return `${line1}\n${line2}`;
  } catch (error) {
    logError("buildThailandSyntheticAddress", error);
    return "เลขที่จำลอง 9397 ซอยตัวอย่าง\nเขตทดสอบ กรุงเทพมหานคร 00000";
  }
}

export function buildUsSyntheticAddress(): string {
  try {
    const houseNum = randomSyntheticHouseNum(1000, 9999);
    const line1 = `Mock #${houseNum} Sample Alley`;
    const line2 = "Test District, TS 00000";
    return `${line1}\n${line2}`;
  } catch (error) {
    logError("buildUsSyntheticAddress", error);
    return "Mock #9397 Sample Alley\nTest District, TS 00000";
  }
}

export function buildJapanSyntheticAddress(): string {
  try {
    const houseNum = randomSyntheticHouseNum(1000, 9999);
    const line1 = `架空番地${houseNum} サンプル町`;
    const line2 = "テスト区 東京都 000-0000";
    return `〒000-0000\n${line1}\n${line2}`;
  } catch (error) {
    logError("buildJapanSyntheticAddress", error);
    return "〒000-0000\n架空番地9397 サンプル町\nテスト区 東京都 000-0000";
  }
}
