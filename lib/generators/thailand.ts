import { faker as fakerTh } from "@faker-js/faker/locale/th";
import { mockApiKey, mockUuid } from "@/lib/ids";
import { formatPanGroups, generatePan16 } from "@/lib/luhn-card";
import { logError } from "@/lib/logger";
import { randomDigit, randomDigits, randomPick } from "@/lib/random-utils";
import type { GeneratedProfile } from "./types";
import { pickRealisticEmail, syntheticGeneratedAt } from "./profile-meta";

const TH_MOBILE_PAIR = ["8", "9"] as const;

const STREET_SAMPLES = [
  "ถนนสุขุมวิท",
  "ถนนพหลโยธิน",
  "ถนนรามคำแหง",
  "ถนนลาดพร้าว",
  "ถนนรัชดาภิเษก",
  "ถนนวิภาวดีรังสิต",
  "ถนนเพชรบุรี",
  "ถนนสีลม",
  "ถนนคอนแวนต์",
  "ถนนพระราม 9",
  "ถนนศรีนครินทร์",
  "ซอยใหญ่ เขตบางนา",
] as const;

const SOI_SAMPLES = ["ซอย 5", "ซอย 12/1", "ซอย พัฒนาการ", "ซอย รามคำแหง 164", "ซอย งามวงศ์วาน"] as const;

type ThaiPlaceSample = readonly [district: string, province: string, zip: string];

const PLACES_FIXED: ThaiPlaceSample[] = [
  ["คลองเตย", "กรุงเทพมหานคร", "10110"],
  ["วัฒนา", "กรุงเทพมหานคร", "10110"],
  ["บางนา", "กรุงเทพมหานคร", "10260"],
  ["หางดง", "เชียงใหม่", "50230"],
  ["เมือง", "ขอนแก่น", "40000"],
  ["เมือง", "นครราชสีมา", "30000"],
  ["เมือง", "ภูเก็ต", "83100"],
  ["เมือง", "ศรีราชา", "20110"],
];

function generateThailandMobileDigits(): string {
  try {
    const mid = `${randomPick(TH_MOBILE_PAIR)!}${randomDigit()}`;
    const tail = randomDigits(7);
    const raw = `0${mid}${tail}`;
    if (/^0[89]\d{8}$/.test(raw)) {
      return raw;
    }
    return `089${randomDigits(7)}`;
  } catch (error) {
    logError("generateThailandMobileDigits", error);
    return `089${randomDigits(7)}`;
  }
}

function formatThailandMobile(display: string): string {
  try {
    const d = display.replace(/\D/g, "");
    if (d.length !== 10 || !/^0[89]/.test(d)) {
      return display;
    }
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  } catch (error) {
    logError("formatThailandMobile", error);
    return display;
  }
}

function buildThailandAddress(): string {
  try {
    const sample = randomPick(PLACES_FIXED)!;
    const [district, province, zip] = sample;
    const houseNum = fakerTh.number.int({ min: 1, max: 999 });
    const mooMaybe = fakerTh.datatype.boolean() ? ` หมู่ ${fakerTh.number.int({ min: 1, max: 20 })}` : "";
    const street = `${randomPick(STREET_SAMPLES)!}${mooMaybe}`;
    const soi = fakerTh.datatype.boolean({ probability: 0.45 }) ? ` ${randomPick(SOI_SAMPLES)!}` : "";

    const line1 = `เลขที่ ${houseNum} ${street}${soi}`;
    const line2 = `${district} ${province} ${zip}`;
    return `${line1}\n${line2}`;
  } catch (error) {
    logError("buildThailandAddress", error);
    return "เลขที่ 99 ถนนสุขุมวิท\nคลองเตย กรุงเทพมหานคร 10110";
  }
}

export function generateThailandProfile(): GeneratedProfile {
  try {
    const firstName = fakerTh.person.firstName();
    const lastName = fakerTh.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const phoneRaw = generateThailandMobileDigits();
    const phone = formatThailandMobile(phoneRaw);
    const address = buildThailandAddress();
    const email = pickRealisticEmail(firstName, lastName, fakerTh);
    const company = fakerTh.company.name();

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
      firstName: "ภาณุ",
      lastName: "ทดสอบ",
      fullName: "ภาณุ ทดสอบ",
      phone: "089-000-1111",
      address: "เลขที่ 1 ถนนสุขุมวิท\nคลองเตย กรุงเทพมหานคร 10110",
      email: "user.placeholder@example.com",
      company: "บจก. ตัวอย่าง เทสดาต้า",
      creditCard: formatPanGroups("4242424242424242"),
      creditCardMasked: "424242xxxxxx4242",
      uuid: mockUuid(),
      apiKeyMock: mockApiKey("sk_test_"),
      isSynthetic: true,
      generatedAt: syntheticGeneratedAt(),
    };
  }
}
