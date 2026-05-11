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
};
