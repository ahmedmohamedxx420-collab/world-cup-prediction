import type { ReactNode } from "react";
import { ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/empty-state";
import { LocalKickoff } from "@/components/local-kickoff";
import { Avatar } from "@/components/ui/avatar";
import type {
  LeaderboardRow,
  MemberProfile,
  UserResult,
} from "@/lib/leaderboard";
import type { FormDot, PlayerStats } from "@/lib/hall-of-fame";
import { sideName } from "@/lib/match-format";
import type { Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

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
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold",
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

function FormDots({
  dots,
  labels,
}: {
  dots: FormDot[];
  labels: Record<FormDot, string>;
}) {
  if (dots.length === 0) return <span className="text-muted-foreground">-</span>;

  return (
    <span className="flex items-center gap-1">
      {dots.map((dot, index) => (
        <span
          key={`${dot}-${index}`}
          aria-label={labels[dot]}
          title={labels[dot]}
          className={cn(
            "size-2.5 rounded-full",
            dot === "exact" && "bg-lime ring-1 ring-black/10",
            dot === "partial" && "bg-gold",
            dot === "miss" && "bg-muted-foreground/35 ring-1 ring-border",
          )}
        />
      ))}
    </span>
  );
}

export async function ResultsBreakdown({
  profile,
  stats,
  results,
  teams,
  locale,
  playerStats,
  exactPoints,
  isCurrentUser = false,
}: {
  profile: MemberProfile;
  stats: LeaderboardRow;
  results: UserResult[];
  teams: Team[];
  locale: string;
  playerStats: PlayerStats;
  exactPoints: number;
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
  const bestMatch = playerStats.bestMatch;
  const bestMatchLabel = bestMatch
    ? t("bestMatchValue", {
        match:
          bestMatch.match.match_number != null
            ? fixturesT("matchNumber", {
                number: bestMatch.match.match_number,
              })
            : scoreText(bestMatch.match.home_score, bestMatch.match.away_score) ??
              `${bestMatch.home_score}-${bestMatch.away_score}`,
        points: bestMatch.points_awarded ?? 0,
      })
    : "-";
  const bestMatchPoints = bestMatch?.points_awarded ?? 0;

  return (
    <section className="space-y-4">
      <header className="space-y-3">
        <div className="wc-banner flex items-center gap-3 rounded-2xl border border-white/15 p-4 text-white shadow-lg">
          <span className="wc-banner__pitch" aria-hidden />
          <span className="wc-banner__floodlight" aria-hidden />
          <span className="wc-banner__net" aria-hidden />
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name}
            className="size-12 ring-2 ring-white/30"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-normal">
              {t("memberResultsTitle", { name })}
            </h1>
            <p className="text-sm text-white/80">
              {t("rankWithPoints", {
                rank: stats.rank,
                points: stats.total_points,
              })}
            </p>
          </div>
          <div className="shrink-0 text-end">
            <span className="block text-2xl font-black tabular-nums text-lime">
              {stats.total_points}
            </span>
            <span className="text-xs font-medium text-white/70">
              {t("pointsShort")}
            </span>
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

        <div className="flex flex-wrap gap-2">
          <StatChip
            label={t("form")}
            value={
              <FormDots
                dots={playerStats.formDots}
                labels={{
                  exact: t("formExact"),
                  partial: t("formPartial"),
                  miss: t("formMiss"),
                }}
              />
            }
          />
          <StatChip
            label={t("currentStreak")}
            value={playerStats.currentStreak}
          />
          <StatChip label={t("bestStreak")} value={playerStats.bestStreak} />
          <StatChip
            label={t("favouriteScore")}
            value={playerStats.favouriteScoreline ?? "-"}
          />
          <StatChip
            label={t("bestMatch")}
            value={bestMatchLabel}
            emphasis={bestMatchPoints >= exactPoints && bestMatch != null}
          />
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
              <li
                key={result.id}
                className="wc-fixture-card rounded-2xl border bg-card/95 p-4 shadow-sm"
              >
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
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-bold tabular-nums",
                        actual
                          ? "bg-gold/20 text-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
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
                    <div className="rounded-xl bg-muted/40 px-3 py-2">
                      <span className="block text-xs text-muted-foreground">
                        {t("prediction")}
                      </span>
                      <span className="text-base font-semibold tabular-nums">
                        {result.home_score}-{result.away_score}
                      </span>
                    </div>
                    <div className="rounded-xl bg-muted/40 px-3 py-2">
                      <span className="block text-xs text-muted-foreground">
                        {t("actual")}
                      </span>
                      <span className="text-base font-semibold tabular-nums">
                        {actual ?? t("resultPending")}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-xl px-3 py-2",
                        result.points_awarded == null
                          ? "bg-muted/40"
                          : "bg-gold/15",
                      )}
                    >
                      <span className="block text-xs text-muted-foreground">
                        {t("points")}
                      </span>
                      <span className="text-base font-bold tabular-nums">
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
