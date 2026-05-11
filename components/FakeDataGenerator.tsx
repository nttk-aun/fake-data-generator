"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FREE_BULK_MAX,
  FREE_BULK_MIN,
  downloadUtf8Csv,
  generateProfilesBulk,
  normalizeFreeTierRowCount,
  openProfilesPrintableTable,
  profilesToCsv,
} from "@/lib/bulk-export";
import {
  type CountryCode,
  type GeneratedProfile,
  generateProfile,
} from "@/lib/generators";
import { logError } from "@/lib/logger";
import {
  countryLabel,
  formatHintMaxRows,
  getUiCopy,
  toBulkExportColumns,
} from "@/lib/ui-strings";

const COUNTRY_CODES = ["TH", "US", "JP"] as const satisfies readonly CountryCode[];

function FieldRow(props: {
  label: string;
  value: string;
  copyText: string;
}) {
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(props.value);
    } catch (error) {
      logError(`FieldRow_copy_${props.label}`, error);
    }
  }, [props.label, props.value]);

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {props.label}
        </span>
        <button
          type="button"
          onClick={() => {
            void copy();
          }}
          className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {props.copyText}
        </button>
      </div>
      <p className="whitespace-pre-wrap font-mono text-sm text-zinc-900 dark:text-zinc-100">
        {props.value}
      </p>
    </div>
  );
}

export function FakeDataGenerator() {
  const [country, setCountry] = useState<CountryCode>("TH");
  const [profile, setProfile] = useState<GeneratedProfile | null>(null);
  const [bulkRows, setBulkRows] = useState<number>(50);
  const [bulkExporting, setBulkExporting] = useState<boolean>(false);

  useEffect(() => {
    try {
      setProfile(generateProfile(country));
    } catch (error) {
      logError("FakeDataGenerator_effect_generate", error);
    }
  }, [country]);

  const regenerate = useCallback(() => {
    try {
      setProfile(generateProfile(country));
    } catch (error) {
      logError("FakeDataGenerator_regenerate", error);
    }
  }, [country]);

  const onCountry = useCallback((c: CountryCode) => {
    try {
      setProfile(null);
      setCountry(c);
    } catch (error) {
      logError("FakeDataGenerator_onCountry", error);
    }
  }, []);

  const onBulkRowsInput = useCallback((raw: string) => {
    try {
      setBulkRows(normalizeFreeTierRowCount(raw));
    } catch (error) {
      logError("FakeDataGenerator_onBulkRowsInput", error);
    }
  }, []);

  const runBulkExport = useCallback(
    (mode: "csv" | "print") => {
      try {
        setBulkExporting(true);
        globalThis.window.setTimeout(() => {
          try {
            const t = getUiCopy(country);
            const safeCount = normalizeFreeTierRowCount(bulkRows);
            const rows = generateProfilesBulk(country, safeCount);
            const columns = toBulkExportColumns(t);
            if (mode === "csv") {
              const csv = profilesToCsv(rows, columns);
              const stamp = new Date().toISOString().slice(0, 10);
              downloadUtf8Csv(`fake-data_${country}_${safeCount}_${stamp}`, csv);
            } else {
              openProfilesPrintableTable({
                profiles: rows,
                documentTitle: `${t.bulkPrintDocTitle} (${safeCount})`,
                columns,
                printControlLabel: t.exportPrintPdf,
              });
            }
          } catch (error) {
            logError("FakeDataGenerator_runBulkExport_inner", error);
          } finally {
            setBulkExporting(false);
          }
        }, 0);
      } catch (error) {
        logError("FakeDataGenerator_runBulkExport", error);
        setBulkExporting(false);
      }
    },
    [bulkRows, country],
  );

  try {
    const t = getUiCopy(country);

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
        </header>

        <div className="flex flex-wrap gap-2">
          {COUNTRY_CODES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCountry(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                country === c
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              }`}
            >
              {countryLabel(c, t)}
            </button>
          ))}
        </div>

        <section
          className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30"
          aria-label={t.bulkSectionTitle}
        >
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t.bulkSectionTitle}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {formatHintMaxRows(t.bulkRowCountHint, FREE_BULK_MAX)}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                {t.bulkRowCountLabel}
              </span>
              <input
                type="number"
                min={FREE_BULK_MIN}
                max={FREE_BULK_MAX}
                step={1}
                value={bulkRows}
                onChange={(e) => onBulkRowsInput(e.target.value)}
                className="h-10 rounded-lg border border-zinc-300 bg-white px-3 font-mono text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={bulkExporting}
                onClick={() => runBulkExport("csv")}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-emerald-700 bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkExporting ? t.bulkExporting : t.exportCsv}
              </button>
              <button
                type="button"
                disabled={bulkExporting}
                onClick={() => runBulkExport("print")}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-zinc-400 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                {bulkExporting ? t.bulkExporting : t.exportPrintPdf}
              </button>
            </div>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-400">
            {t.bulkUpgradeNote}
          </p>
        </section>

        <button
          type="button"
          disabled={profile === null}
          onClick={regenerate}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.regenerate}
        </button>

        {profile === null ? (
          <p className="text-sm text-zinc-500">{t.loading}</p>
        ) : (
          <section className="grid gap-3">
            <FieldRow
              label={t.fieldFirstName}
              value={profile.firstName}
              copyText={t.copy}
            />
            <FieldRow
              label={t.fieldLastName}
              value={profile.lastName}
              copyText={t.copy}
            />
            <FieldRow
              label={t.fieldFullName}
              value={profile.fullName}
              copyText={t.copy}
            />
            <FieldRow
              label={t.fieldPhone}
              value={profile.phone}
              copyText={t.copy}
            />
            <FieldRow
              label={t.fieldAddress}
              value={profile.address}
              copyText={t.copy}
            />
            <FieldRow
              label={t.fieldEmail}
              value={profile.email}
              copyText={t.copy}
            />
            <FieldRow
              label={t.fieldCompany}
              value={profile.company}
              copyText={t.copy}
            />
            <FieldRow
              label={t.fieldCreditCard}
              value={profile.creditCard}
              copyText={t.copy}
            />
            <FieldRow
              label={t.fieldPanMasked}
              value={profile.creditCardMasked}
              copyText={t.copy}
            />
            <FieldRow label={t.fieldUuid} value={profile.uuid} copyText={t.copy} />
            <FieldRow
              label={t.fieldApiKey}
              value={profile.apiKeyMock}
              copyText={t.copy}
            />
          </section>
        )}
      </div>
    );
  } catch (error) {
    logError("FakeDataGenerator_render", error);
    return (
      <div className="p-10 text-center text-sm text-red-600">
        Something went wrong. Please reload the page.
      </div>
    );
  }
}
