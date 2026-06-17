import { ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/empty-state";
import { LocalKickoff } from "@/components/local-kickoff";
import type {
  LeaderboardRow,
  MemberProfile,
  UserResult,
} from "@/lib/leaderboard";
import { sideName } from "@/lib/match-format";
import type { Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function scoreText(home: number | null, away: number | null) {
  if (home == null || away == null) return null;
  return `${home}-${away}`;
}

function StatChip({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string | number;
  emphasis?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
        emphasis
          ? "border-primary/25 bg-primary/10 text-primary"
          : "bg-muted/40 text-muted-foreground",
      )}
    >
      <span className="font-semibold tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  );
}

export async function ResultsBreakdown({
  profile,
  stats,
  results,
  teams,
  locale,
  isCurrentUser = false,
}: {
  profile: MemberProfile;
  stats: LeaderboardRow;
  results: UserResult[];
  teams: Team[];
  locale: string;
  isCurrentUser?: boolean;
}) {
  const [t, fixturesT, stagesT] = await Promise.all([
    getTranslations("leaderboard"),
    getTranslations("fixtures"),
    getTranslations("admin.fixtures.stages"),
  ]);
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const name = isCurrentUser
    ? `${profile.full_name} ${t("you")}`
    : profile.full_name;

  return (
    <section className="space-y-4">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
            {initials(profile.full_name)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-normal">
              {t("memberResultsTitle", { name })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("rankWithPoints", {
                rank: stats.rank,
                points: stats.total_points,
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatChip
            label={t("pointsShort")}
            value={stats.total_points}
            emphasis
          />
          <StatChip label={t("predictionsMade")} value={stats.predictions_made} />
          <StatChip label={t("exact")} value={stats.exact_count} />
          <StatChip label={t("goalDiff")} value={stats.gd_count} />
          <StatChip label={t("winner")} value={stats.winner_count} />
          <StatChip label={t("miss")} value={stats.miss_count} />
        </div>
      </header>

      {results.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-8" aria-hidden />}
          title={t("emptyResults")}
          description={t("emptyResultsDescription")}
        />
      ) : (
        <ul className="space-y-3">
          {results.map((result) => {
            const match = result.match;
            const homeName = sideName(
              teamMap,
              match.home_team_id,
              match.home_label,
              fixturesT("tbd"),
            );
            const awayName = sideName(
              teamMap,
              match.away_team_id,
              match.away_label,
              fixturesT("tbd"),
            );
            const actual = scoreText(match.home_score, match.away_score);

            return (
              <li key={result.id} className="rounded-lg border bg-card p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {match.match_number != null ? (
                      <span className="tabular-nums">
                        {fixturesT("matchNumber", {
                          number: match.match_number,
                        })}
                      </span>
                    ) : null}
                    <span>{stagesT(match.stage)}</span>
                    {match.group_letter ? (
                      <span>
                        {fixturesT("group", { group: match.group_letter })}
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <span className="truncate text-start text-sm font-semibold">
                      {homeName}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                      {actual ?? fixturesT("vs")}
                    </span>
                    <span className="truncate text-start text-sm font-semibold">
                      {awayName}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <LocalKickoff
                      iso={match.kickoff_at}
                      locale={locale}
                      closesLabel={fixturesT("closesAtKickoff")}
                      lockedLabel={fixturesT("locked")}
                    />
                    {match.venue ? <span>{match.venue}</span> : null}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-md bg-muted/40 px-3 py-2">
                      <span className="block text-xs text-muted-foreground">
                        {t("prediction")}
                      </span>
                      <span className="text-base font-semibold tabular-nums">
                        {result.home_score}-{result.away_score}
                      </span>
                    </div>
                    <div className="rounded-md bg-muted/40 px-3 py-2">
                      <span className="block text-xs text-muted-foreground">
                        {t("actual")}
                      </span>
                      <span className="text-base font-semibold tabular-nums">
                        {actual ?? t("resultPending")}
                      </span>
                    </div>
                    <div className="rounded-md bg-muted/40 px-3 py-2">
                      <span className="block text-xs text-muted-foreground">
                        {t("points")}
                      </span>
                      <span className="text-base font-semibold tabular-nums">
                        {result.points_awarded == null
                          ? t("pointsPending")
                          : t("pointsValue", {
                              points: result.points_awarded,
                            })}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
