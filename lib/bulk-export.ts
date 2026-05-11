import { generateProfile } from "@/lib/generators";
import type { CountryCode } from "@/lib/generators/types";
import type { GeneratedProfile } from "@/lib/generators/types";
import { logError } from "@/lib/logger";

export const EXPORT_FIELD_ORDER = [
  "country",
  "firstName",
  "lastName",
  "fullName",
  "phone",
  "address",
  "email",
  "company",
  "creditCard",
  "creditCardMasked",
  "uuid",
  "apiKeyMock",
] as const satisfies readonly (keyof GeneratedProfile)[];

export type BulkExportColumn = {
  readonly key: (typeof EXPORT_FIELD_ORDER)[number];
  readonly label: string;
};

/** Rows allowed on the free tier (no signup). Larger packs are reserved for membership. */
export const FREE_BULK_MIN = 10;
export const FREE_BULK_MAX = 100;

export function normalizeFreeTierRowCount(input: unknown): number {
  try {
    const n = Math.floor(Number(input));
    if (!Number.isFinite(n)) {
      return FREE_BULK_MIN;
    }
    return Math.min(FREE_BULK_MAX, Math.max(FREE_BULK_MIN, n));
  } catch (error) {
    logError("normalizeFreeTierRowCount", error);
    return FREE_BULK_MIN;
  }
}

/** Guest (not signed in with Google): small bulk export only. */
export const GUEST_BULK_MIN = 1;
export const GUEST_BULK_MAX = 10;

export function normalizeGuestBulkRowCount(input: unknown): number {
  try {
    const n = Math.floor(Number(input));
    if (!Number.isFinite(n)) {
      return GUEST_BULK_MIN;
    }
    return Math.min(GUEST_BULK_MAX, Math.max(GUEST_BULK_MIN, n));
  } catch (error) {
    logError("normalizeGuestBulkRowCount", error);
    return GUEST_BULK_MIN;
  }
}

export function normalizeBulkRowCount(
  input: unknown,
  signedIn: boolean,
): number {
  try {
    return signedIn
      ? normalizeFreeTierRowCount(input)
      : normalizeGuestBulkRowCount(input);
  } catch (error) {
    logError("normalizeBulkRowCount", error);
    return signedIn ? FREE_BULK_MIN : GUEST_BULK_MIN;
  }
}

export function generateProfilesBulk(
  country: CountryCode,
  count: number,
  signedIn: boolean,
): GeneratedProfile[] {
  try {
    const safe = normalizeBulkRowCount(count, signedIn);
    const list: GeneratedProfile[] = [];
    for (let i = 0; i < safe; i += 1) {
      list.push(generateProfile(country));
    }
    return list;
  } catch (error) {
    logError("generateProfilesBulk", error);
    return [];
  }
}

function escapeHtmlCell(value: string): string {
  try {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  } catch (error) {
    logError("escapeHtmlCell", error);
    return "";
  }
}

/** RFC4180-ish CSV cell encoding (UTF-8). */
export function encodeCsvCell(value: string): string {
  try {
    const inner = `${value}`;
    if (/[\r\n",]/.test(inner)) {
      return `"${inner.replace(/"/g, '""')}"`;
    }
    return inner;
  } catch (error) {
    logError("encodeCsvCell", error);
    return "";
  }
}

export function profilesToCsv(
  profiles: GeneratedProfile[],
  columns: readonly BulkExportColumn[],
): string {
  try {
    const BOM = "\uFEFF";
    const headerLine = `${columns.map((c) => encodeCsvCell(c.label)).join(",")}\r\n`;
    const bodyLines = profiles.map((profile) =>
      `${columns.map((c) => encodeCsvCell(profile[c.key])).join(",")}\r\n`,
    );
    return BOM + headerLine + bodyLines.join("");
  } catch (error) {
    logError("profilesToCsv", error);
    return "\uFEFF";
  }
}

export function downloadUtf8Csv(filenameBase: string, csvText: string): void {
  try {
    const safeName =
      /\.csv$/i.test(filenameBase) ? filenameBase : `${filenameBase}.csv`;
    const blob = new Blob([csvText], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = safeName;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    logError("downloadUtf8Csv", error);
  }
}

/** Opens a printable table in a new tab (browser “Save as PDF” via print dialog). */
export function openProfilesPrintableTable(opts: {
  profiles: GeneratedProfile[];
  documentTitle: string;
  columns: readonly BulkExportColumn[];
  printControlLabel: string;
}): void {
  try {
    const w = globalThis.window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
      throw new Error("open_profiles_print_blocked");
    }
    const { profiles, columns, documentTitle, printControlLabel } = opts;

    const thead = `<tr>${columns.map((col) => `<th>${escapeHtmlCell(col.label)}</th>`).join("")}</tr>`;

    const tbody = profiles
      .map((p) => {
        const cells = columns
          .map((col) => {
            let cell = `${p[col.key]}`;
            if (col.key === "address") {
              cell = cell.replace(/\r?\n/g, " / ");
            }
            return `<td>${escapeHtmlCell(cell)}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtmlCell(documentTitle)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: system-ui, "Segoe UI", "Noto Sans Thai", "Hiragino Sans", sans-serif; font-size: 8px; color: #111; }
  h1 { font-size: 12px; margin: 0 0 8px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; word-break: break-word; }
  th { background: #f3f4f6; font-weight: 600; font-size: 7px; }
  @media print { body { margin: 0; } button { display: none; } }
</style>
</head>
<body>
<button type="button" onclick="window.print()">${escapeHtmlCell(printControlLabel)}</button>
<h1>${escapeHtmlCell(documentTitle)}</h1>
<table>${thead}${tbody}</table>
</body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
  } catch (error) {
    logError("openProfilesPrintableTable", error);
  }
}
