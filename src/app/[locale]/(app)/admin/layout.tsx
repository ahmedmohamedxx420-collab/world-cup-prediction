import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/profile";
import { AdminNav } from "./admin-nav";

// Admin-only area. The parent (app) layout already guarantees an authenticated
// user with a profile row; here we additionally require is_admin. Middleware
// also lists /admin as an app route so unauthenticated requests are bounced to
// login at the edge (defense in depth).
export default async function AdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();
  if (!profile?.is_admin) {
    redirect({ href: "/fixtures", locale });
    return null;
  }

  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
