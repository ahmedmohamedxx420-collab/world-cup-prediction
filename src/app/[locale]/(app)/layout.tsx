import { getTranslations, setRequestLocale } from "next-intl/server";
import { Shield } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MainNav } from "@/components/main-nav";
import { BottomNav } from "@/components/bottom-nav";
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
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4">
          <span className="font-bold">{t("appName")}</span>
          <div className="flex items-center gap-2">
            <MainNav />
            {profile.is_admin ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
