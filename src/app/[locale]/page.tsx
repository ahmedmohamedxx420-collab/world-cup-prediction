import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { BrandWordmark } from "@/components/brand-wordmark";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/profile";

// Splash landing shown at the locale root. Signed-in users skip it and go
// straight to /fixtures; everyone else sees the brand front door and the Start
// button (which heads into /fixtures, where middleware routes them to login).
export default async function LocaleIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user) {
    redirect({ href: "/fixtures", locale });
  }

  const t = await getTranslations("common");

  return (
    <main className="bg-pitch relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center text-white">
      {/* Ambient stadium atmosphere: floodlight wash + a soft net glow rising
          from the base, layered behind the content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 start-[-10%] -z-0 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(198,242,78,0.22),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/3 end-[-10%] -z-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(244,197,74,0.16),transparent_70%)] blur-2xl"
      />

      <div className="absolute top-4 end-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 flex max-w-xl flex-col items-center gap-7">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-white/75 backdrop-blur-sm">
          {t("welcome")}
        </span>

        <BrandWordmark size="hero" tone="dark" />

        <p className="text-xs font-bold uppercase tracking-[0.22em] text-lime-300/90 sm:text-sm">
          {t("competition")}
        </p>

        <p className="text-balance text-base text-white/85 sm:text-lg">
          {t("tagline")}
        </p>

        <Link
          href="/fixtures"
          className={buttonVariants({
            variant: "lime",
            size: "lg",
            className:
              "mt-2 h-14 gap-2.5 rounded-full px-10 text-lg font-bold transition-transform duration-200 hover:scale-[1.04] focus-visible:scale-[1.04]",
          })}
        >
          {t("start")}
          <ArrowRight className="size-5 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </main>
  );
}
