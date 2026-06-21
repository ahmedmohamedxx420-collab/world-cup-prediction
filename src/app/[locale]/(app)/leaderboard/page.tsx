import { Info, Trophy } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/empty-state";
import { HallOfFame } from "@/components/hall-of-fame";
import { ResultsBreakdown } from "@/components/results-breakdown";
import { ScoringStrip } from "@/components/scoring-legend";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { getAppSettings } from "@/lib/app-settings";
import {
  computeHallOfFame,
  computePlayerStats,
  type Badge,
  type PlayerStats,
} from "@/lib/hall-of-fame";
import {
  getLeaderboard,
  getMemberStats,
  getUserResults,
  type LeaderboardRow,
  type MemberProfile,
  type UserResult,
  MemberStatsUnavailableError,
} from "@/lib/leaderboard";
import { getCurrentUser } from "@/lib/profile";
import { listTeams, type Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

type Tab = "board" | "hall-of-fame" | "my-results";

function tabHref(tab: Tab) {
  if (tab === "board") return "/leaderboard";
  return `/leaderboard?tab=${tab}`;
}

function TabLink({
  tab,
  activeTab,
  label,
}: {
  tab: Tab;
  activeTab: Tab;
  label: string;
}) {
  const active = tab === activeTab;

  return (
    <Link
      href={tabHref(tab)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-3 py-2 text-center text-sm font-semibold transition-colors",
        active
          ? "bg-lime text-lime-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

const STAT_TONES = {
  lime: "bg-lime/20 text-foreground",
  gold: "bg-gold/20 text-gold-foreground",
  emerald: "bg-primary/10 text-primary",
  muted: "bg-muted/50 text-muted-foreground",
} as const;

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: number;
  tone?: keyof typeof STAT_TONES;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        STAT_TONES[tone],
      )}
    >
      <span className="font-semibold tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function BoardRow({
  row,
  mine,
  t,
}: {
  row: LeaderboardRow;
  mine: boolean;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  // Top-3 medal treatment on the rank badge.
  const medal =
    row.rank === 1
      ? "bg-gold-grad text-gold-foreground shadow-gold"
      : row.rank === 2
        ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-300"
        : row.rank === 3
          ? "bg-amber-700/20 text-amber-800 dark:text-amber-300"
          : "bg-muted text-muted-foreground";

  return (
    <li>
      <Link
        href={`/leaderboard/${row.user_id}`}
        className={cn(
          "wc-fixture-card grid gap-3 rounded-2xl border bg-card/95 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center",
          mine && "border-primary/30 bg-primary/5",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black tabular-nums",
              medal,
            )}
          >
            {row.rank}
          </span>
          <Avatar src={row.avatar_url} name={row.full_name} />
        </span>

        <span className="min-w-0 space-y-2">
          <span className="block truncate text-sm font-semibold">
            {row.full_name}
            {mine ? ` ${t("you")}` : ""}
          </span>
          <span className="flex flex-wrap gap-1.5">
            <StatPill label={t("exact")} value={row.exact_count} tone="lime" />
            <StatPill label={t("goalDiff")} value={row.gd_count} tone="gold" />
            <StatPill
              label={t("winner")}
              value={row.winner_count}
              tone="emerald"
            />
            <StatPill label={t("miss")} value={row.miss_count} />
            <StatPill
              label={t("predictionsMade")}
              value={row.predictions_made}
            />
          </span>
        </span>

        <span className="flex items-end justify-between gap-3 sm:flex-col sm:justify-center sm:text-end">
          <span className="inline-flex items-center gap-1.5">
            {row.rank === 1 ? (
              <Trophy className="size-5 text-gold" aria-hidden />
            ) : null}
            <span className="text-2xl font-black tabular-nums">
              {row.total_points}
            </span>
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {t("pointsShort")}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const activeTab: Tab =
    query.tab === "hall-of-fame"
      ? "hall-of-fame"
      : query.tab === "my-results"
        ? "my-results"
        : "board";
  const [leaderboard, user, t, scoringT, appSettings] = await Promise.all([
    getLeaderboard(),
    getCurrentUser(),
    getTranslations("leaderboard"),
    getTranslations("scoring"),
    getAppSettings(),
  ]);
  const currentUserId = user?.id;
  const myRow = currentUserId
    ? leaderboard.find((row) => row.user_id === currentUserId)
    : undefined;

  // Display-only mirror of the scoring tiers (DB stays the source of truth).
  const scoringPoints = {
    exact: appSettings.exact_points,
    margin: appSettings.goal_diff_points,
    winner: appSettings.winner_points,
  };

  let myProfile: MemberProfile | null = null;
  let myResults: UserResult[] | null = null;
  let teams: Team[] | null = null;
  let playerStats: PlayerStats | null = null;
  let hallBadges: Badge[] | null = null;
  let hallSetupPending = false;

  if (activeTab === "hall-of-fame") {
    try {
      const memberStats = await getMemberStats();
      hallBadges = computeHallOfFame(memberStats);
    } catch (error) {
      if (error instanceof MemberStatsUnavailableError) {
        hallSetupPending = true;
      } else {
        throw error;
      }
    }
  }

  if (activeTab === "my-results" && currentUserId && myRow) {
    const [results, teamRows] = await Promise.all([
      getUserResults(currentUserId),
      listTeams(),
    ]);
    myProfile = {
      id: myRow.user_id,
      full_name: myRow.full_name,
      avatar_url: myRow.avatar_url,
    };
    myResults = results;
    teams = teamRows;
    playerStats = computePlayerStats(results, appSettings.exact_points);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-3">
          <span className="wc-page-kicker">
            <Trophy className="size-4" aria-hidden />
            {t("title")}
          </span>
          <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
            {t("title")}
          </h1>
        </div>
        {myRow ? (
          <div className="flex flex-wrap gap-2 md:justify-end">
            <span className="wc-field-chip">
              {t("rank")}
              <span className="font-black tabular-nums">#{myRow.rank}</span>
            </span>
            <span className="wc-field-chip text-primary">
              {t("pointsShort")}
              <span className="font-black tabular-nums">
                {myRow.total_points}
              </span>
            </span>
            <span className="wc-field-chip">
              {t("exact")}
              <span className="font-black tabular-nums">
                {myRow.exact_count}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      <section className="space-y-3 rounded-2xl border bg-card/95 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">{scoringT("title")}</h2>
        </div>
        <ScoringStrip points={scoringPoints} />
        <p className="text-xs text-muted-foreground">{scoringT("footnote")}</p>
      </section>

      <div className="space-y-3">
        <nav
          aria-label={t("tabsLabel")}
          className="grid grid-cols-3 rounded-full border bg-card/85 p-1 shadow-sm"
        >
          <TabLink tab="board" activeTab={activeTab} label={t("boardTab")} />
          <TabLink
            tab="hall-of-fame"
            activeTab={activeTab}
            label={t("hallOfFameTab")}
          />
          <TabLink
            tab="my-results"
            activeTab={activeTab}
            label={t("myResultsTab")}
          />
        </nav>
      </div>

      {activeTab === "board" ? (
        leaderboard.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-8" aria-hidden />}
            title={t("empty")}
            description={t("emptyDescription")}
          />
        ) : (
          <ol className="space-y-3">
            {leaderboard.map((row) => (
              <BoardRow
                key={row.user_id}
                row={row}
                mine={row.user_id === currentUserId}
                t={t}
              />
            ))}
          </ol>
        )
      ) : activeTab === "hall-of-fame" && hallSetupPending ? (
        <EmptyState
          icon={<Trophy className="size-8" aria-hidden />}
          title={t("hallOfFame.setupPendingTitle")}
          description={t("hallOfFame.setupPendingDescription")}
        />
      ) : activeTab === "hall-of-fame" && hallBadges ? (
        <HallOfFame badges={hallBadges} locale={locale} />
      ) : myProfile && myRow && myResults && teams && playerStats ? (
        <ResultsBreakdown
          profile={myProfile}
          stats={myRow}
          results={myResults}
          teams={teams}
          locale={locale}
          playerStats={playerStats}
          settings={appSettings}
          isCurrentUser
        />
      ) : (
        <EmptyState
          icon={<Trophy className="size-8" aria-hidden />}
          title={t("emptyResults")}
          description={t("emptyResultsDescription")}
        />
      )}
    </div>
  );
}
