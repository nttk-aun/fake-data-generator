import { logError } from "@/lib/logger";
import { generateJapanProfile } from "./japan";
import type { CountryCode, GeneratedProfile } from "./types";
import { generateThailandProfile } from "./thailand";
import { generateUnitedStatesProfile } from "./united-states";

export type { CountryCode, GeneratedProfile } from "./types";

export function generateProfile(country: CountryCode): GeneratedProfile {
  try {
    if (country === "TH") {
      return generateThailandProfile();
    }
    if (country === "US") {
      return generateUnitedStatesProfile();
    }
    return generateJapanProfile();
  } catch (error) {
    logError("generateProfile", error);
    return generateUnitedStatesProfile();
  }
}
