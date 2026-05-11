import type { BulkExportColumn } from "@/lib/bulk-export";
import { FREE_BULK_MAX, GUEST_BULK_MAX } from "@/lib/bulk-export";
import type { CountryCode } from "@/lib/generators/types";
import { logError } from "@/lib/logger";

export type UiLang = "th" | "en" | "ja";

export function localeForCountry(country: CountryCode): UiLang {
  try {
    if (country === "TH") {
      return "th";
    }
    if (country === "JP") {
      return "ja";
    }
    return "en";
  } catch (error) {
    logError("localeForCountry", error);
    return "en";
  }
}

export type UiCopy = {
  title: string;
  subtitle: string;
  countryTh: string;
  countryUs: string;
  countryJp: string;
  regenerate: string;
  copy: string;
  loading: string;
  fieldFirstName: string;
  fieldLastName: string;
  fieldFullName: string;
  fieldPhone: string;
  fieldAddress: string;
  fieldEmail: string;
  fieldCompany: string;
  fieldCreditCard: string;
  fieldPanMasked: string;
  fieldUuid: string;
  fieldApiKey: string;
  bulkSectionTitle: string;
  bulkRowCountLabel: string;
  bulkRowCountHint: string;
  bulkUpgradeNote: string;
  exportCsv: string;
  exportPrintPdf: string;
  bulkExporting: string;
  bulkPrintDocTitle: string;
  colCountry: string;
  colFirstName: string;
  colLastName: string;
  colFullName: string;
  colPhone: string;
  colAddress: string;
  colEmail: string;
  colCompany: string;
  colCreditCard: string;
  colCreditCardMasked: string;
  colUuid: string;
  colApiKey: string;
};

const TH: UiCopy = {
  title: "เครื่องสร้างข้อมูลจำลอง",
  subtitle:
    "สร้างข้อมูลปลอมตามประเทศที่เลือก ไม่เรียก API ภายนอก — บัตรและ API key ใช้เทสเท่านั้น",
  countryTh: "ไทย (TH)",
  countryUs: "สหรัฐอเมริกา (US)",
  countryJp: "ญี่ปุ่น (JP)",
  regenerate: "สุ่มชุดใหม่",
  copy: "คัดลอก",
  loading: "กำลังสร้างข้อมูล…",
  fieldFirstName: "ชื่อ",
  fieldLastName: "นามสกุล",
  fieldFullName: "ชื่อเต็ม",
  fieldPhone: "เบอร์โทร",
  fieldAddress: "ที่อยู่",
  fieldEmail: "อีเมล",
  fieldCompany: "ชื่อบริษัท",
  fieldCreditCard: "บัตรเครดิต (ปลอม · ผ่าน Luhn)",
  fieldPanMasked: "เลขการ์ดปิดบัง",
  fieldUuid: "UUID",
  fieldApiKey: "API key (จำลอง)",
  bulkSectionTitle: "ส่งออกหลายแถว (CSV / พิมพ์)",
  bulkRowCountLabel: "จำนวนแถวที่ส่งออก",
  bulkRowCountHint:
    "ยังไม่ล็อกอิน: ส่งออกได้สูงสุด {{guest}} แถว — ล็อกอินด้วย Google (มุมขวา) ได้สูงสุด {{member}} แถว",
  bulkUpgradeNote:
    "ถ้าต้องการ 1,000+ แถว ให้สมัครสมาชิกหรือติดต่อทีม (กำลังพัฒนา)",
  exportCsv: "ดาวน์โหลด CSV",
  exportPrintPdf: "เปิดพิมพ์ / PDF",
  bulkExporting: "กำลังเตรียมข้อมูล…",
  bulkPrintDocTitle: "รายการข้อมูลจำลอง — พิมพ์หรือบันทึกเป็น PDF",
  colCountry: "country",
  colFirstName: "first_name",
  colLastName: "last_name",
  colFullName: "full_name",
  colPhone: "phone",
  colAddress: "address",
  colEmail: "email",
  colCompany: "company",
  colCreditCard: "credit_card_fake",
  colCreditCardMasked: "pan_masked",
  colUuid: "uuid",
  colApiKey: "api_key_mock",
};

const EN: UiCopy = {
  title: "Fake Data Generator",
  subtitle:
    "Country-aware mock identities — runs locally only. Fake cards/API keys are for testing.",
  countryTh: "Thailand (TH)",
  countryUs: "United States (US)",
  countryJp: "Japan (JP)",
  regenerate: "Regenerate",
  copy: "Copy",
  loading: "Generating…",
  fieldFirstName: "First name",
  fieldLastName: "Last name",
  fieldFullName: "Full name",
  fieldPhone: "Phone",
  fieldAddress: "Address",
  fieldEmail: "Email",
  fieldCompany: "Company",
  fieldCreditCard: "Credit card (fake · Luhn-valid)",
  fieldPanMasked: "Masked PAN",
  fieldUuid: "UUID",
  fieldApiKey: "API key (mock)",
  bulkSectionTitle: "Bulk export (CSV / print)",
  bulkRowCountLabel: "Number of rows",
  bulkRowCountHint:
    "Not signed in: up to {{guest}} rows — Sign in with Google (top right) for up to {{member}} rows",
  bulkUpgradeNote:
    "Need 1,000+ rows? Membership / team plan (coming soon).",
  exportCsv: "Download CSV",
  exportPrintPdf: "Print / Save as PDF",
  bulkExporting: "Preparing…",
  bulkPrintDocTitle: "Mock data table — print or save as PDF",
  colCountry: "country",
  colFirstName: "first_name",
  colLastName: "last_name",
  colFullName: "full_name",
  colPhone: "phone",
  colAddress: "address",
  colEmail: "email",
  colCompany: "company",
  colCreditCard: "credit_card_fake",
  colCreditCardMasked: "pan_masked",
  colUuid: "uuid",
  colApiKey: "api_key_mock",
};

const JA: UiCopy = {
  title: "フェイクデータ生成",
  subtitle:
    "国ごとのモック情報をローカルで生成 — 外部APIは使いません。カード/APIキーは検証用のダミーです。",
  countryTh: "タイ (TH)",
  countryUs: "アメリカ合衆国 (US)",
  countryJp: "日本 (JP)",
  regenerate: "再生成",
  copy: "コピー",
  loading: "生成中…",
  fieldFirstName: "名",
  fieldLastName: "姓",
  fieldFullName: "氏名",
  fieldPhone: "電話番号",
  fieldAddress: "住所",
  fieldEmail: "メール",
  fieldCompany: "会社名",
  fieldCreditCard: "クレジットカード（ダミー・Luhn整合）",
  fieldPanMasked: "マスク済みカード番号",
  fieldUuid: "UUID",
  fieldApiKey: "APIキー（モック）",
  bulkSectionTitle: "一括出力（CSV / 印刷）",
  bulkRowCountLabel: "出力行数",
  bulkRowCountHint:
    "未ログイン: 最大 {{guest}} 行 — 右上の Google でログインすると最大 {{member}} 行",
  bulkUpgradeNote:
    "1,000行以上が必要なら会員／チームプラン（準備中）へお問い合わせください",
  exportCsv: "CSVをダウンロード",
  exportPrintPdf: "印刷／PDFとして保存",
  bulkExporting: "準備中…",
  bulkPrintDocTitle: "モックデータ一覧 — 印刷またはPDF保存",
  colCountry: "country",
  colFirstName: "first_name",
  colLastName: "last_name",
  colFullName: "full_name",
  colPhone: "phone",
  colAddress: "address",
  colEmail: "email",
  colCompany: "company",
  colCreditCard: "credit_card_fake",
  colCreditCardMasked: "pan_masked",
  colUuid: "uuid",
  colApiKey: "api_key_mock",
};

export function getUiCopy(country: CountryCode): UiCopy {
  try {
    const lang = localeForCountry(country);
    if (lang === "th") {
      return TH;
    }
    if (lang === "ja") {
      return JA;
    }
    return EN;
  } catch (error) {
    logError("getUiCopy", error);
    return EN;
  }
}

export function countryLabel(country: CountryCode, t: UiCopy): string {
  try {
    if (country === "TH") {
      return t.countryTh;
    }
    if (country === "US") {
      return t.countryUs;
    }
    return t.countryJp;
  } catch (error) {
    logError("countryLabel", error);
    return country;
  }
}

export function toBulkExportColumns(t: UiCopy): BulkExportColumn[] {
  try {
    return [
      { key: "country", label: t.colCountry },
      { key: "firstName", label: t.colFirstName },
      { key: "lastName", label: t.colLastName },
      { key: "fullName", label: t.colFullName },
      { key: "phone", label: t.colPhone },
      { key: "address", label: t.colAddress },
      { key: "email", label: t.colEmail },
      { key: "company", label: t.colCompany },
      { key: "creditCard", label: t.colCreditCard },
      { key: "creditCardMasked", label: t.colCreditCardMasked },
      { key: "uuid", label: t.colUuid },
      { key: "apiKeyMock", label: t.colApiKey },
    ];
  } catch (error) {
    logError("toBulkExportColumns", error);
    return [
      { key: "country", label: "country" },
      { key: "firstName", label: "first_name" },
      { key: "lastName", label: "last_name" },
      { key: "fullName", label: "full_name" },
      { key: "phone", label: "phone" },
      { key: "address", label: "address" },
      { key: "email", label: "email" },
      { key: "company", label: "company" },
      { key: "creditCard", label: "credit_card_fake" },
      { key: "creditCardMasked", label: "pan_masked" },
      { key: "uuid", label: "uuid" },
      { key: "apiKeyMock", label: "api_key_mock" },
    ];
  }
}

export function formatHintMaxRows(hintTemplate: string, max: number): string {
  try {
    return hintTemplate.replace(/\{\{\s*max\s*\}\}/g, `${max}`);
  } catch (error) {
    logError("formatHintMaxRows", error);
    return hintTemplate;
  }
}

export function formatBulkRowHint(hintTemplate: string): string {
  try {
    return hintTemplate
      .replace(/\{\{\s*guest\s*\}\}/g, `${GUEST_BULK_MAX}`)
      .replace(/\{\{\s*member\s*\}\}/g, `${FREE_BULK_MAX}`);
  } catch (error) {
    logError("formatBulkRowHint", error);
    return hintTemplate;
  }
}
