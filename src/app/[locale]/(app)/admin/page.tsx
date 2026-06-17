import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

// /admin opens on the fixtures tab.
export default async function AdminIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: "/admin/fixtures", locale });
  return null;
}
