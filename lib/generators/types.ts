export type CountryCode = "TH" | "US" | "JP";

export type GeneratedProfile = {
  country: CountryCode;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  /** Short human-readable address block */
  address: string;
  email: string;
  company: string;
  creditCard: string;
  creditCardMasked: string;
  uuid: string;
  apiKeyMock: string;
  /** Always true — record is intentionally synthetic, not a real person. */
  isSynthetic: boolean;
  /** ISO-8601 time this row was generated. */
  generatedAt: string;
};
