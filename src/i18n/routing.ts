import { defineRouting } from "next-intl/routing";

// Arabic is the default locale (RTL); English is secondary (LTR).
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
});

export type Locale = (typeof routing.locales)[number];
