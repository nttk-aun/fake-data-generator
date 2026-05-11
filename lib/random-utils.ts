import { logError } from "./logger";

export function randomDigit(): string {
  try {
    return String(Math.floor(Math.random() * 10));
  } catch (error) {
    logError("randomDigit", error);
    return "0";
  }
}

export function randomDigits(count: number): string {
  try {
    let s = "";
    for (let i = 0; i < Math.max(0, count); i += 1) {
      s += randomDigit();
    }
    return s;
  } catch (error) {
    logError("randomDigits", error);
    return "".padStart(Math.max(0, count), "0");
  }
}

export function randomPick<T>(items: readonly T[]): T | undefined {
  try {
    if (!items.length) {
      throw new Error("randomPick_empty_list");
    }
    const idx = Math.floor(Math.random() * items.length);
    return items[idx];
  } catch (error) {
    logError("randomPick", error);
    return items[0];
  }
}

export function shuffleInPlace<T>(arr: T[]): T[] {
  try {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j]!;
      arr[j] = t!;
    }
    return arr;
  } catch (error) {
    logError("shuffleInPlace", error);
    return arr;
  }
}
