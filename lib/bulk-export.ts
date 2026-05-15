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
  "isSynthetic",
  "generatedAt",
] as const satisfies readonly (keyof GeneratedProfile)[];

/** Prepended to CSV exports (single metadata row). */
export const CSV_SYNTHETIC_DISCLAIMER_ROW =
  "# SYNTHETIC_MOCK_DATA — not real persons; do not SMS/call/KYC; for dev/test only";

export type BulkExportColumn = {
  readonly key: (typeof EXPORT_FIELD_ORDER)[number];
  readonly label: string;
};

/** Rows allowed for signed-in users before DB cap (floor). */
export const FREE_BULK_MIN = 10;
/** Default cap for free tier in UI copy / hints when not reading DB. */
export const FREE_BULK_MAX = 100;

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
  opts: { isGuest: boolean; maxRowsWhenSignedIn: number },
): number {
  try {
    if (opts.isGuest) {
      return normalizeGuestBulkRowCount(input);
    }
    const cap = Math.max(FREE_BULK_MIN, Math.floor(opts.maxRowsWhenSignedIn));
    const n = Math.floor(Number(input));
    if (!Number.isFinite(n)) {
      return Math.min(cap, FREE_BULK_MIN);
    }
    return Math.min(cap, Math.max(FREE_BULK_MIN, n));
  } catch (error) {
    logError("normalizeBulkRowCount", error);
    return opts.isGuest ? GUEST_BULK_MIN : FREE_BULK_MIN;
  }
}

export function generateProfilesBulk(
  country: CountryCode,
  count: number,
  opts: { isGuest: boolean; maxRowsWhenSignedIn: number },
): GeneratedProfile[] {
  try {
    const safe = normalizeBulkRowCount(count, opts);
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
    const disclaimerLine = `${encodeCsvCell(CSV_SYNTHETIC_DISCLAIMER_ROW)}\r\n`;
    const headerLine = `${columns.map((c) => encodeCsvCell(c.label)).join(",")}\r\n`;
    const bodyLines = profiles.map((profile) =>
      `${columns.map((c) => encodeCsvCell(String(profile[c.key]))).join(",")}\r\n`,
    );
    return BOM + disclaimerLine + headerLine + bodyLines.join("");
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

function buildProfilesPrintableHtml(opts: {
  profiles: GeneratedProfile[];
  documentTitle: string;
  columns: readonly BulkExportColumn[];
}): string {
  const { profiles, columns, documentTitle } = opts;
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
  const printDisclaimer =
    "SYNTHETIC MOCK DATA — not real persons. Do not SMS, call, or use for KYC/production identity.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtmlCell(documentTitle)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: system-ui, "Segoe UI", "Noto Sans Thai", "Hiragino Sans", sans-serif; font-size: 8px; color: #111; }
  h1 { font-size: 12px; margin: 0 0 8px; font-weight: 600; }
  .disclaimer { font-size: 7px; color: #92400e; background: #fffbeb; border: 1px solid #fcd34d; padding: 6px 8px; margin: 0 0 8px; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; word-break: break-word; }
  th { background: #f3f4f6; font-weight: 600; font-size: 7px; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>${escapeHtmlCell(documentTitle)}</h1>
<p class="disclaimer">${escapeHtmlCell(printDisclaimer)}</p>
<table>${thead}${tbody}</table>
</body></html>`;
}

function downloadPrintableHtml(filenameBase: string, html: string): void {
  const safeName = /\.html?$/i.test(filenameBase) ? filenameBase : `${filenameBase}.html`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
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
}

/** Opens the browser print dialog (Save as PDF) without a popup — avoids blocker after async work. */
export function printProfilesTable(opts: {
  profiles: GeneratedProfile[];
  documentTitle: string;
  columns: readonly BulkExportColumn[];
  downloadFilenameBase?: string;
}): void {
  try {
    const html = buildProfilesPrintableHtml(opts);
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) {
      iframe.remove();
      throw new Error("print_iframe_unavailable");
    }

    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      try {
        iframe.remove();
      } catch {
        /* ignore */
      }
    };
    win.addEventListener("afterprint", cleanup, { once: true });
    globalThis.window.setTimeout(cleanup, 120_000);

    win.focus();
    win.print();
  } catch (error) {
    logError("printProfilesTable", error);
    try {
      const html = buildProfilesPrintableHtml(opts);
      const base =
        opts.downloadFilenameBase ??
        `fake-data-print_${new Date().toISOString().slice(0, 10)}`;
      downloadPrintableHtml(base, html);
    } catch (fallbackErr) {
      logError("printProfilesTable_fallback_download", fallbackErr);
    }
  }
}
