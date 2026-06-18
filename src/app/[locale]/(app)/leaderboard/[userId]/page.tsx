import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ResultsBreakdown } from "@/components/results-breakdown";
import { BackLink } from "@/components/back-link";
import { getAppSettings } from "@/lib/app-settings";
import { computePlayerStats } from "@/lib/hall-of-fame";
import {
  getLeaderboard,
  getMemberProfile,
  getUserResults,
} from "@/lib/leaderboard";
import { getCurrentUser } from "@/lib/profile";
import { listTeams } from "@/lib/teams";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function MemberResultsPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  if (!UUID_RE.test(userId)) notFound();

  const [profile, leaderboard, results, teams, user, settings, t] = await Promise.all([
    getMemberProfile(userId),
    getLeaderboard(),
    getUserResults(userId),
    listTeams(),
    getCurrentUser(),
    getAppSettings(),
    getTranslations("leaderboard"),
  ]);
  const stats = leaderboard.find((row) => row.user_id === userId);

  if (!profile || !stats) notFound();

  const playerStats = computePlayerStats(results, settings.exact_points);

  return (
    <div className="space-y-5">
      <BackLink href="/leaderboard" label={t("backToBoard")} />

      <ResultsBreakdown
        profile={profile}
        stats={stats}
        results={results}
        teams={teams}
        locale={locale}
        playerStats={playerStats}
        exactPoints={settings.exact_points}
        isCurrentUser={user?.id === userId}
      />
    </div>
  );
}
