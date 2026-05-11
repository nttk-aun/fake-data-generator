import { logError } from "./logger";
import { randomDigit } from "./random-utils";

/**
 * Calculates the Luhn check digit for digits that will precede it (PAN without final digit).
 * Resulting PAN = body + digit passes Luhn.
 */
export function luhnComputeCheckDigit(bodyWithoutCheckDigit: string): string {
  try {
    const digitsOnly = bodyWithoutCheckDigit.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = true;
    for (let i = digitsOnly.length - 1; i >= 0; i -= 1) {
      let d = Number.parseInt(digitsOnly[i]!, 10);
      if (!Number.isFinite(d)) {
        continue;
      }
      if (shouldDouble) {
        d *= 2;
        if (d > 9) {
          d -= 9;
        }
      }
      sum += d;
      shouldDouble = !shouldDouble;
    }
    return `${(10 - (sum % 10)) % 10}`;
  } catch (error) {
    logError("luhnComputeCheckDigit", error);
    return "0";
  }
}

/** 16-digit fictional PAN that passes Luhn (test BIN + random filler). Not for payments. */
export function generatePan16(binPrefix: string): string {
  try {
    let body = `${binPrefix}`.replace(/\D/g, "").slice(0, 15);
    while (body.length < 15) {
      body += randomDigit();
    }
    body = body.slice(0, 15);
    const pan = `${body}${luhnComputeCheckDigit(body)}`;
    return pan.slice(0, 16);
  } catch (error) {
    logError("generatePan16", error);
    return "4242424242424242";
  }
}

export function formatPanGroups(pan: string): string {
  try {
    const d = pan.replace(/\D/g, "");
    const parts: string[] = [];
    for (let i = 0; i < d.length; i += 4) {
      parts.push(d.slice(i, i + 4));
    }
    return parts.join(" ");
  } catch (error) {
    logError("formatPanGroups", error);
    return pan;
  }
}
