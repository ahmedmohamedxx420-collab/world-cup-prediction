"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

// Toggles between Arabic and English, preserving the current path. The page
// visibly mirrors (RTL ⇄ LTR) because `dir` is driven by the locale.
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");

  const other = locale === "ar" ? "en" : "ar";

  function switchLocale() {
    const suffix =
      typeof window === "undefined"
        ? ""
        : `${window.location.search}${window.location.hash}`;

    router.replace(`${pathname}${suffix}`, { locale: other });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={switchLocale}
      aria-label={t("label")}
    >
      {t(other)}
    </Button>
  );
}
