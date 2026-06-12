import { getTranslations } from "next-intl/server";
import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default async function FixturesPage() {
  const t = await getTranslations();
  return (
    <EmptyState
      icon={<CalendarDays className="size-8" aria-hidden />}
      title={t("nav.fixtures")}
      description={t("comingSoon.description")}
    />
  );
}
