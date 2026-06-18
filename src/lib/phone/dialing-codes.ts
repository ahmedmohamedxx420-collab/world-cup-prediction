export type PhoneCountry = {
  iso2: string;
  dialCode: string;
  nationalDigits: number;
  nameKey: `countries.${string}`;
  searchName: string;
};

export const PHONE_COUNTRIES = [
  { iso2: "SD", dialCode: "249", nationalDigits: 9, searchName: "Sudan" },
  {
    iso2: "SA",
    dialCode: "966",
    nationalDigits: 9,
    searchName: "Saudi Arabia",
  },
  {
    iso2: "AE",
    dialCode: "971",
    nationalDigits: 9,
    searchName: "United Arab Emirates UAE Emirates",
  },
  { iso2: "KW", dialCode: "965", nationalDigits: 8, searchName: "Kuwait" },
  { iso2: "QA", dialCode: "974", nationalDigits: 8, searchName: "Qatar" },
  { iso2: "BH", dialCode: "973", nationalDigits: 8, searchName: "Bahrain" },
  { iso2: "OM", dialCode: "968", nationalDigits: 8, searchName: "Oman" },
  { iso2: "EG", dialCode: "20", nationalDigits: 10, searchName: "Egypt" },
  { iso2: "JO", dialCode: "962", nationalDigits: 9, searchName: "Jordan" },
  { iso2: "LB", dialCode: "961", nationalDigits: 8, searchName: "Lebanon" },
  { iso2: "IQ", dialCode: "964", nationalDigits: 10, searchName: "Iraq" },
  { iso2: "PS", dialCode: "970", nationalDigits: 9, searchName: "Palestine" },
  { iso2: "YE", dialCode: "967", nationalDigits: 9, searchName: "Yemen" },
  { iso2: "SY", dialCode: "963", nationalDigits: 9, searchName: "Syria" },
  { iso2: "LY", dialCode: "218", nationalDigits: 9, searchName: "Libya" },
  { iso2: "TN", dialCode: "216", nationalDigits: 8, searchName: "Tunisia" },
  { iso2: "DZ", dialCode: "213", nationalDigits: 9, searchName: "Algeria" },
  { iso2: "MA", dialCode: "212", nationalDigits: 9, searchName: "Morocco" },
  { iso2: "TR", dialCode: "90", nationalDigits: 10, searchName: "Turkey" },
  { iso2: "IR", dialCode: "98", nationalDigits: 10, searchName: "Iran" },
  { iso2: "IL", dialCode: "972", nationalDigits: 9, searchName: "Israel" },
  { iso2: "US", dialCode: "1", nationalDigits: 10, searchName: "United States USA America" },
  { iso2: "GB", dialCode: "44", nationalDigits: 10, searchName: "United Kingdom UK Britain" },
  { iso2: "IN", dialCode: "91", nationalDigits: 10, searchName: "India" },
  { iso2: "PK", dialCode: "92", nationalDigits: 10, searchName: "Pakistan" },
  { iso2: "BD", dialCode: "880", nationalDigits: 10, searchName: "Bangladesh" },
  { iso2: "MY", dialCode: "60", nationalDigits: 9, searchName: "Malaysia" },
  { iso2: "ID", dialCode: "62", nationalDigits: 10, searchName: "Indonesia" },
  { iso2: "PH", dialCode: "63", nationalDigits: 10, searchName: "Philippines" },
  { iso2: "LK", dialCode: "94", nationalDigits: 9, searchName: "Sri Lanka" },
  { iso2: "NP", dialCode: "977", nationalDigits: 10, searchName: "Nepal" },
  { iso2: "CN", dialCode: "86", nationalDigits: 11, searchName: "China" },
  { iso2: "JP", dialCode: "81", nationalDigits: 10, searchName: "Japan" },
  { iso2: "KR", dialCode: "82", nationalDigits: 10, searchName: "South Korea Korea" },
  { iso2: "FR", dialCode: "33", nationalDigits: 9, searchName: "France" },
  { iso2: "DE", dialCode: "49", nationalDigits: 11, searchName: "Germany" },
  { iso2: "IT", dialCode: "39", nationalDigits: 10, searchName: "Italy" },
  { iso2: "ES", dialCode: "34", nationalDigits: 9, searchName: "Spain" },
  { iso2: "NL", dialCode: "31", nationalDigits: 9, searchName: "Netherlands Holland" },
  { iso2: "BE", dialCode: "32", nationalDigits: 9, searchName: "Belgium" },
  { iso2: "CH", dialCode: "41", nationalDigits: 9, searchName: "Switzerland" },
  { iso2: "AT", dialCode: "43", nationalDigits: 10, searchName: "Austria" },
  { iso2: "DK", dialCode: "45", nationalDigits: 8, searchName: "Denmark" },
  { iso2: "SE", dialCode: "46", nationalDigits: 9, searchName: "Sweden" },
  { iso2: "NO", dialCode: "47", nationalDigits: 8, searchName: "Norway" },
  { iso2: "FI", dialCode: "358", nationalDigits: 9, searchName: "Finland" },
  { iso2: "PL", dialCode: "48", nationalDigits: 9, searchName: "Poland" },
  { iso2: "GR", dialCode: "30", nationalDigits: 10, searchName: "Greece" },
  { iso2: "PT", dialCode: "351", nationalDigits: 9, searchName: "Portugal" },
  { iso2: "RU", dialCode: "7", nationalDigits: 10, searchName: "Russia" },
  { iso2: "UA", dialCode: "380", nationalDigits: 9, searchName: "Ukraine" },
  { iso2: "BR", dialCode: "55", nationalDigits: 11, searchName: "Brazil" },
  { iso2: "AR", dialCode: "54", nationalDigits: 10, searchName: "Argentina" },
  { iso2: "MX", dialCode: "52", nationalDigits: 10, searchName: "Mexico" },
  { iso2: "ZA", dialCode: "27", nationalDigits: 9, searchName: "South Africa" },
  { iso2: "NG", dialCode: "234", nationalDigits: 10, searchName: "Nigeria" },
  { iso2: "ET", dialCode: "251", nationalDigits: 9, searchName: "Ethiopia" },
  { iso2: "KE", dialCode: "254", nationalDigits: 9, searchName: "Kenya" },
  { iso2: "AU", dialCode: "61", nationalDigits: 9, searchName: "Australia" },
  { iso2: "NZ", dialCode: "64", nationalDigits: 9, searchName: "New Zealand" },
].map((country) => ({
  ...country,
  nameKey: `countries.${country.iso2}` as `countries.${string}`,
})) satisfies PhoneCountry[];

export const DEFAULT_PHONE_COUNTRY =
  PHONE_COUNTRIES.find((country) => country.iso2 === "SA") ??
  PHONE_COUNTRIES[0];

export function flagEmoji(iso2: string): string {
  const upperIso = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upperIso)) return "";

  return Array.from(upperIso)
    .map((letter) =>
      String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65),
    )
    .join("");
}
