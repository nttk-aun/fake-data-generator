import { logError } from "./logger";
import { randomDigits } from "./random-utils";

export function mockUuid(): string {
  try {
    const c = globalThis.crypto;
    if (c && typeof c.randomUUID === "function") {
      return c.randomUUID();
    }
    return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0;
      const v = ch === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } catch (error) {
    logError("mockUuid", error);
    return "00000000-0000-4000-b000-000000000001";
  }
}

export function mockApiKey(prefix: string = "sk_test_"): string {
  try {
    const hexAlphabet = "0123456789abcdef";
    let hex = "";
    for (let i = 0; i < 32; i += 1) {
      hex += hexAlphabet[Math.floor(Math.random() * hexAlphabet.length)]!;
    }
    return `${prefix}${hex}`;
  } catch (error) {
    logError("mockApiKey", error);
    return `${prefix}${randomDigits(32)}`;
  }
}
