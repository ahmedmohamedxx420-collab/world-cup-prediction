import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ResultsBreakdown } from "@/components/results-breakdown";
import { Link } from "@/i18n/navigation";
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

  const [profile, leaderboard, results, teams, user, t] = await Promise.all([
    getMemberProfile(userId),
    getLeaderboard(),
    getUserResults(userId),
    listTeams(),
    getCurrentUser(),
    getTranslations("leaderboard"),
  ]);
  const stats = leaderboard.find((row) => row.user_id === userId);

  if (!profile || !stats) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/leaderboard"
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {t("backToBoard")}
      </Link>

      <ResultsBreakdown
        profile={profile}
        stats={stats}
        results={results}
        teams={teams}
        locale={locale}
        isCurrentUser={user?.id === userId}
      />
    </div>
  );
}
