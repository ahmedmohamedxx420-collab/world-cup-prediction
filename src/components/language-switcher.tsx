"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      // `text-foreground` keeps the label readable on any surface (the splash
      // sets `text-white`, which the outline button would otherwise inherit and
      // hide). The sizing classes win over `size="sm"` via tailwind-merge.
      className={cn(
        "h-9 rounded-full px-4 text-sm font-semibold text-foreground",
        className,
      )}
      onClick={switchLocale}
      aria-label={t("label")}
    >
      {t(other)}
    </Button>
  );
}
