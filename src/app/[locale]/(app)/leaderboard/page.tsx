import { Trophy } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/empty-state";
import { ResultsBreakdown } from "@/components/results-breakdown";
import { Link } from "@/i18n/navigation";
import {
  getLeaderboard,
  getUserResults,
  type LeaderboardRow,
  type MemberProfile,
  type UserResult,
} from "@/lib/leaderboard";
import { getCurrentUser } from "@/lib/profile";
import { listTeams, type Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

type Tab = "board" | "my-results";

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

function tabHref(tab: Tab) {
  return tab === "board" ? "/leaderboard" : "/leaderboard?tab=my-results";
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
        "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
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
  return (
    <li>
      <Link
        href={`/leaderboard/${row.user_id}`}
        className={cn(
          "grid gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50 sm:grid-cols-[auto_1fr_auto] sm:items-center",
          mine && "border-primary/30 bg-primary/5",
        )}
      >
        <span className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums text-muted-foreground">
            {row.rank}
          </span>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
            {initials(row.full_name)}
          </span>
        </span>

        <span className="min-w-0 space-y-2">
          <span className="block truncate text-sm font-semibold">
            {row.full_name}
            {mine ? ` ${t("you")}` : ""}
          </span>
          <span className="flex flex-wrap gap-1.5">
            <StatPill label={t("exact")} value={row.exact_count} />
            <StatPill label={t("goalDiff")} value={row.gd_count} />
            <StatPill label={t("winner")} value={row.winner_count} />
            <StatPill label={t("miss")} value={row.miss_count} />
            <StatPill
              label={t("predictionsMade")}
              value={row.predictions_made}
            />
          </span>
        </span>

        <span className="flex items-end justify-between gap-3 sm:flex-col sm:justify-center sm:text-end">
          <span className="text-2xl font-semibold tabular-nums">
            {row.total_points}
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
    query.tab === "my-results" ? "my-results" : "board";
  const [leaderboard, user, t] = await Promise.all([
    getLeaderboard(),
    getCurrentUser(),
    getTranslations("leaderboard"),
  ]);
  const currentUserId = user?.id;
  const myRow = currentUserId
    ? leaderboard.find((row) => row.user_id === currentUserId)
    : undefined;

  let myProfile: MemberProfile | null = null;
  let myResults: UserResult[] | null = null;
  let teams: Team[] | null = null;

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
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-normal">
          {t("title")}
        </h1>
        <nav
          aria-label={t("tabsLabel")}
          className="grid grid-cols-2 rounded-lg border bg-muted/40 p-1"
        >
          <TabLink tab="board" activeTab={activeTab} label={t("boardTab")} />
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
      ) : myProfile && myRow && myResults && teams ? (
        <ResultsBreakdown
          profile={myProfile}
          stats={myRow}
          results={myResults}
          teams={teams}
          locale={locale}
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
