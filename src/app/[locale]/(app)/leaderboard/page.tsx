import { getTranslations } from "next-intl/server";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default async function LeaderboardPage() {
  const t = await getTranslations();
  return (
    <EmptyState
      icon={<Trophy className="size-8" aria-hidden />}
      title={t("nav.leaderboard")}
      description={t("comingSoon.description")}
    />
  );
}
