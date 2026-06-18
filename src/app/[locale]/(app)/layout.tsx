import { getTranslations, setRequestLocale } from "next-intl/server";
import { Shield } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MainNav } from "@/components/main-nav";
import { BottomNav } from "@/components/bottom-nav";
import { SoccerBall } from "@/components/ui/soccer-ball";
import { Link, redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/profile";

// Shell shared by the three main tabs: a sticky header (app name + desktop nav +
// language switcher) and a mobile bottom nav. The (app) route group adds no path
// segment, so children live at /[locale]/fixtures etc.
export default async function AppLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();
  if (!profile) {
    redirect({ href: "/onboarding", locale });
    return null;
  }

  const t = await getTranslations("common");
  const nav = await getTranslations("nav");

  return (
    <div className="wc-app-shell flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link
            href="/fixtures"
            className="flex min-w-0 items-center gap-2 font-black tracking-normal"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime-grad p-1.5 shadow-lime ring-1 ring-black/5">
              <SoccerBall className="size-full" />
            </span>
            <span className="truncate">{t("appName")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <MainNav />
            {profile.is_admin ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                <Shield className="size-4" aria-hidden />
                <span className="hidden sm:inline">{nav("admin")}</span>
              </Link>
            ) : null}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* pb-20 clears the fixed bottom nav on mobile; restored at md+. */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-7 pb-24 md:pb-8">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
