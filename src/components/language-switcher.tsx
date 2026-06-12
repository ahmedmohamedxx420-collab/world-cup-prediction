"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

// Toggles between Arabic and English, preserving the current path. The page
// visibly mirrors (RTL ⇄ LTR) because `dir` is driven by the locale.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");

  const other = locale === "ar" ? "en" : "ar";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.replace(pathname, { locale: other })}
      aria-label={t("label")}
    >
      {t(other)}
    </Button>
  );
}
