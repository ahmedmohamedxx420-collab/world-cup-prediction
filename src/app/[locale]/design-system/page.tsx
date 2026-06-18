import { setRequestLocale } from "next-intl/server";
import { DesignSystem } from "./design-system";

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DesignSystem />;
}
