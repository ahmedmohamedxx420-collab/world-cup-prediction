import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LocalKickoff } from "@/components/local-kickoff";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listMatches } from "@/lib/matches";
import type { Match } from "@/lib/match-types";
import { sideName } from "@/lib/match-format";
import { getMyPredictions, type Prediction } from "@/lib/predictions";
import { listTeams } from "@/lib/teams";

type Tab = "upcoming" | "finished";

type MatchGroup = {
  key: string;
  label: string;
  items: Match[];
};

function isLocked(match: Match, now: number) {
  return Date.parse(match.kickoff_at) <= now;
}

function isTbd(match: Match) {
  return match.home_team_id == null || match.away_team_id == null;
}

function scoreText(home: number | null, away: number | null) {
  if (home == null || away == null) return null;
  return `${home}-${away}`;
}

function predictionText(prediction: Prediction) {
  return `${prediction.home_score}-${prediction.away_score}`;
}

function formatDateKey(key: string, locale: string) {
  const date = new Date(`${key}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return key;

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function groupByDate(matches: Match[], locale: string): MatchGroup[] {
  const groups = new Map<string, Match[]>();

  for (const match of matches) {
    const key = new Date(match.kickoff_at).toISOString().slice(0, 10);
    groups.set(key, [...(groups.get(key) ?? []), match]);
  }

  return Array.from(groups, ([key, items]) => ({
    key,
    label: formatDateKey(key, locale),
    items,
  }));
}

function tabHref(tab: Tab) {
  return tab === "upcoming" ? "/fixtures" : "/fixtures?tab=finished";
}

async function getServerNow() {
  return Date.now();
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

function RowCta({
  match,
  locked,
  prediction,
  tbd,
  t,
}: {
  match: Match;
  locked: boolean;
  prediction: Prediction | undefined;
  tbd: boolean;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const result = scoreText(match.home_score, match.away_score);

  if (tbd) {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        {t("tbdLocked")}
      </span>
    );
  }

  if (locked) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">
          {result ?? t("locked")}
        </span>
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none",
          )}
        >
          {t("view")}
        </span>
      </span>
    );
  }

  if (prediction) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">
          {predictionText(prediction)}
        </span>
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none",
          )}
        >
          {t("edit")}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(buttonVariants({ size: "sm" }), "pointer-events-none")}
    >
      {t("predict")}
    </span>
  );
}

export default async function FixturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const activeTab: Tab = query.tab === "finished" ? "finished" : "upcoming";
  const [matches, teams, myPredictions] = await Promise.all([
    listMatches(),
    listTeams(),
    getMyPredictions(),
  ]);

  const t = await getTranslations("fixtures");
  const stagesT = await getTranslations("admin.fixtures.stages");
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const now = await getServerNow();
  const upcoming = matches.filter((match) => !isLocked(match, now));
  const finished = matches.filter((match) => isLocked(match, now)).reverse();
  const visibleMatches = activeTab === "upcoming" ? upcoming : finished;
  const groups = groupByDate(visibleMatches, locale);

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
          <TabLink
            tab="upcoming"
            activeTab={activeTab}
            label={t("upcoming")}
          />
          <TabLink
            tab="finished"
            activeTab={activeTab}
            label={t("finished")}
          />
        </nav>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-8" aria-hidden />}
          title={t(activeTab === "upcoming" ? "emptyUpcoming" : "emptyFinished")}
          description={t("emptyDescription")}
        />
      ) : (
        groups.map((group) => (
          <section key={group.key} className="space-y-2">
            <h2 className="px-1 text-sm font-semibold text-muted-foreground">
              {group.label}
            </h2>
            <ul className="divide-y overflow-hidden rounded-lg border bg-card">
              {group.items.map((match) => {
                const prediction = myPredictions.get(match.id);
                const locked = isLocked(match, now);
                const tbd = isTbd(match);
                const result = scoreText(match.home_score, match.away_score);

                return (
                  <li key={match.id}>
                    <Link
                      href={`/fixtures/${match.id}`}
                      className="grid gap-3 px-4 py-4 transition-colors hover:bg-accent/50 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <span className="min-w-0 space-y-2">
                        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {match.match_number != null ? (
                            <span className="tabular-nums">
                              {t("matchNumber", {
                                number: match.match_number,
                              })}
                            </span>
                          ) : null}
                          <span>{stagesT(match.stage)}</span>
                          {match.group_letter ? (
                            <span>{t("group", { group: match.group_letter })}</span>
                          ) : null}
                        </span>

                        <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <span className="truncate text-start text-sm font-semibold">
                            {sideName(
                              teamMap,
                              match.home_team_id,
                              match.home_label,
                              t("tbd"),
                            )}
                          </span>
                          <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                            {result ?? t("vs")}
                          </span>
                          <span className="truncate text-start text-sm font-semibold">
                            {sideName(
                              teamMap,
                              match.away_team_id,
                              match.away_label,
                              t("tbd"),
                            )}
                          </span>
                        </span>

                        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <LocalKickoff
                            iso={match.kickoff_at}
                            locale={locale}
                            closesLabel={t("closesAtKickoff")}
                            lockedLabel={t("locked")}
                          />
                          {match.venue ? <span>{match.venue}</span> : null}
                        </span>
                      </span>

                      <span className="flex items-center justify-between gap-3 sm:justify-end">
                        <RowCta
                          match={match}
                          locked={locked}
                          prediction={prediction}
                          tbd={tbd}
                          t={t}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
