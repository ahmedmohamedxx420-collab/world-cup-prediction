import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, Clock3, Goal, MapPin, Trophy } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LiveBadge } from "@/components/live-badge";
import { LocalKickoff } from "@/components/local-kickoff";
import { MatchBanner } from "@/components/match-banner";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listMatches } from "@/lib/matches";
import type { Match } from "@/lib/match-types";
import { formatScoreline, sideLabel } from "@/lib/match-format";
import { getMyPredictions, type Prediction } from "@/lib/predictions";
import { listTeams } from "@/lib/teams";

type Tab = "upcoming" | "ongoing" | "finished";

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

function isFinished(match: Match) {
  return (
    match.status === "finished" ||
    (match.status !== "live" &&
      match.home_score != null &&
      match.away_score != null)
  );
}

function isLiveMatch(match: Match, now: number) {
  return (
    !isTbd(match) &&
    !isFinished(match) &&
    (match.status === "live" || isLocked(match, now))
  );
}

function predictionText(prediction: Prediction) {
  return formatScoreline(prediction.home_score, prediction.away_score);
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

function dateKeyFromTime(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

function formatRelativeDayLabel(
  key: string,
  todayKey: string,
  tomorrowKey: string,
  locale: string,
) {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (key === todayKey) return formatter.format(0, "day");
  if (key === tomorrowKey) return formatter.format(1, "day");
  return null;
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
  if (tab === "upcoming") return "/fixtures";
  if (tab === "ongoing") return "/fixtures?tab=ongoing";
  return "/fixtures?tab=finished";
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

function RowCta({
  match,
  locked,
  inProgress,
  prediction,
  tbd,
  t,
}: {
  match: Match;
  locked: boolean;
  inProgress: boolean;
  prediction: Prediction | undefined;
  tbd: boolean;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const result = formatScoreline(match.home_score, match.away_score);

  if (tbd) {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        {t("tbdLocked")}
      </span>
    );
  }

  if (inProgress) {
    return (
      <span className="flex items-center gap-2">
        <LiveBadge label={t("inProgress")} />
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

  if (locked) {
    return (
      <span className="flex items-center gap-2">
        <span
          className="text-sm font-semibold tabular-nums"
          dir={result ? "ltr" : "auto"}
        >
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
        <span className="text-sm font-semibold tabular-nums" dir="ltr">
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

  const requestedTab = query.tab;
  const [matches, teams, myPredictions] = await Promise.all([
    listMatches(),
    listTeams(),
    getMyPredictions(),
  ]);

  const t = await getTranslations("fixtures");
  const stagesT = await getTranslations("admin.fixtures.stages");
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const now = await getServerNow();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const todayKey = dateKeyFromTime(now);
  const tomorrowKey = dateKeyFromTime(now + DAY_MS);

  // Finished = has a final score (or is flagged finished). A match that has
  // kicked off but isn't finished yet is "in progress" and goes to Ongoing.
  const finished = matches.filter((match) => isFinished(match));
  const notFinished = matches.filter((match) => !isFinished(match));
  const live = notFinished.filter((match) => isLiveMatch(match, now));
  const notStarted = notFinished.filter(
    (match) => !isLiveMatch(match, now) && !isLocked(match, now),
  );
  const showOngoing = live.length > 0;
  const activeTab: Tab =
    requestedTab === "finished"
      ? "finished"
      : requestedTab === "ongoing" && showOngoing
        ? "ongoing"
        : "upcoming";

  // Upcoming shows only the next not-yet-started "batch": matches that fall
  // within 24h of the earliest upcoming one (listMatches() pre-sorts by kickoff
  // ascending, so notStarted[0] is next).
  const batchAnchor = notStarted[0]
    ? Date.parse(notStarted[0].kickoff_at)
    : null;
  const nextBatch =
    batchAnchor == null
      ? notStarted
      : notStarted.filter(
          (match) => Date.parse(match.kickoff_at) < batchAnchor + DAY_MS,
        );

  const visibleMatches =
    activeTab === "upcoming"
      ? nextBatch
      : activeTab === "finished"
        ? [...finished].reverse()
        : [];
  const groups = groupByDate(visibleMatches, locale);

  // Featured match banners are reserved for live fixtures on the Ongoing tab.
  // Upcoming matches stay in the regular list so the hero treatment means
  // "watch now" without duplicating rows.
  const liveHeroMatches = activeTab === "ongoing" ? live : [];

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
        <div className="flex flex-wrap gap-2 md:justify-end">
          {live.length > 0 ? (
            <span className="wc-field-chip text-primary">
              <Goal className="size-3.5" aria-hidden />
              <span className="tabular-nums">{live.length}</span>
              {t("inProgress")}
            </span>
          ) : null}
          <span className="wc-field-chip">
            <CalendarDays className="size-3.5" aria-hidden />
            <span className="tabular-nums">{nextBatch.length}</span>
            {t("upcoming")}
          </span>
          <span className="wc-field-chip">
            <Trophy className="size-3.5" aria-hidden />
            <span className="tabular-nums">{finished.length}</span>
            {t("finished")}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <nav
          aria-label={t("tabsLabel")}
          className={cn(
            "grid rounded-full border bg-card/85 p-1 shadow-sm",
            showOngoing ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          <TabLink
            tab="upcoming"
            activeTab={activeTab}
            label={t("upcoming")}
          />
          {showOngoing ? (
            <TabLink
              tab="ongoing"
              activeTab={activeTab}
              label={t("inProgress")}
            />
          ) : null}
          <TabLink
            tab="finished"
            activeTab={activeTab}
            label={t("finished")}
          />
        </nav>
      </div>

      {activeTab === "ongoing" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {liveHeroMatches.map((match) => {
            const result = formatScoreline(match.home_score, match.away_score);

            return (
              <MatchBanner
                key={match.id}
                homeName={sideLabel(
                  teamMap,
                  match.home_team_id,
                  match.home_label,
                  t("tbd"),
                  locale,
                )}
                awayName={sideLabel(
                  teamMap,
                  match.away_team_id,
                  match.away_label,
                  t("tbd"),
                  locale,
                )}
                homeFlag={teamMap.get(match.home_team_id ?? -1)?.flag}
                awayFlag={teamMap.get(match.away_team_id ?? -1)?.flag}
                centerLabel={result ?? t("vs")}
                centerLabelDirection={result ? "ltr" : "auto"}
                venue={match.venue}
                topStart={
                  <>
                    {match.match_number != null ? (
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
                        {t("matchNumber", { number: match.match_number })}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
                      {stagesT(match.stage)}
                    </span>
                    {match.group_letter ? (
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
                        {t("group", { group: match.group_letter })}
                      </span>
                    ) : null}
                  </>
                }
                topEnd={<LiveBadge label={t("inProgress")} />}
              >
                <Link
                  href={`/fixtures/${match.id}`}
                  className={buttonVariants({ variant: "lime", size: "lg" })}
                >
                  {t("view")}
                </Link>
              </MatchBanner>
            );
          })}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-8" aria-hidden />}
          title={t(activeTab === "upcoming" ? "emptyUpcoming" : "emptyFinished")}
          description={t("emptyDescription")}
        />
      ) : (
        groups.map((group) => {
          const relativeLabel = formatRelativeDayLabel(
            group.key,
            todayKey,
            tomorrowKey,
            locale,
          );
          const dayTone =
            group.key === todayKey
              ? "is-today"
              : group.key === tomorrowKey
                ? "is-tomorrow"
                : undefined;

          return (
            <section
              key={group.key}
              className={cn("wc-match-day space-y-3", dayTone)}
            >
              <div className="wc-match-day__header">
                <span className="wc-match-day__marker" aria-hidden />
                <span className="min-w-0">
                  <h2 className="wc-match-day__title">
                    {relativeLabel ?? group.label}
                  </h2>
                  {relativeLabel ? (
                    <span className="wc-match-day__date">{group.label}</span>
                  ) : null}
                </span>
                <span className="wc-match-day__count tabular-nums" aria-hidden>
                  {group.items.length}
                </span>
              </div>
              <ul className="space-y-2">
                {group.items.map((match) => {
                  const prediction = myPredictions.get(match.id);
                  const locked = isLocked(match, now);
                  const tbd = isTbd(match);
                  const inProgress = isLiveMatch(match, now);
                  const result = formatScoreline(
                    match.home_score,
                    match.away_score,
                  );

                  return (
                    <li key={match.id}>
                      <Link
                        href={`/fixtures/${match.id}`}
                        className={cn(
                          "wc-fixture-card grid gap-4 rounded-2xl border bg-card/95 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[1fr_auto] sm:items-center",
                          inProgress && "is-live border-primary/30",
                        )}
                      >
                        <span className="min-w-0 space-y-2">
                          <span className="flex flex-wrap items-center gap-1.5">
                            {match.match_number != null ? (
                              <span className="wc-field-chip tabular-nums">
                                {t("matchNumber", {
                                  number: match.match_number,
                                })}
                              </span>
                            ) : null}
                            <span className="wc-field-chip">
                              {stagesT(match.stage)}
                            </span>
                            {match.group_letter ? (
                              <span className="wc-field-chip">
                                {t("group", { group: match.group_letter })}
                              </span>
                            ) : null}
                          </span>

                          <span className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 [direction:ltr]">
                            <span className="flex min-w-0 items-center gap-1.5">
                              {teamMap.get(match.home_team_id ?? -1)?.flag ? (
                                <span
                                  aria-hidden
                                  className="text-xl leading-none drop-shadow-sm"
                                >
                                  {teamMap.get(match.home_team_id ?? -1)?.flag}
                                </span>
                              ) : null}
                              <span
                                className="truncate text-start text-base font-black tracking-normal"
                                dir="auto"
                              >
                                {sideLabel(
                                  teamMap,
                                  match.home_team_id,
                                  match.home_label,
                                  t("tbd"),
                                  locale,
                                )}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-3 py-1.5 text-center text-xs font-black tabular-nums whitespace-nowrap shadow-sm",
                                result
                                  ? "bg-gold-grad text-gold-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                              dir={result ? "ltr" : "auto"}
                            >
                              {result ?? t("vs")}
                            </span>
                            <span className="flex min-w-0 items-center gap-1.5">
                              {teamMap.get(match.away_team_id ?? -1)?.flag ? (
                                <span
                                  aria-hidden
                                  className="text-xl leading-none drop-shadow-sm"
                                >
                                  {teamMap.get(match.away_team_id ?? -1)?.flag}
                                </span>
                              ) : null}
                              <span
                                className="truncate text-start text-base font-black tracking-normal"
                                dir="auto"
                              >
                                {sideLabel(
                                  teamMap,
                                  match.away_team_id,
                                  match.away_label,
                                  t("tbd"),
                                  locale,
                                )}
                              </span>
                            </span>
                          </span>

                          <span className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="size-3.5" aria-hidden />
                              <LocalKickoff
                                iso={match.kickoff_at}
                                locale={locale}
                                closesLabel={t("closesAtKickoff")}
                                lockedLabel={t("locked")}
                              />
                            </span>
                            {match.venue ? (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="size-3.5" aria-hidden />
                                {match.venue}
                              </span>
                            ) : null}
                          </span>
                        </span>

                        <span className="flex items-center justify-between gap-3 sm:justify-end">
                          <RowCta
                            match={match}
                            locked={locked}
                            inProgress={inProgress}
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
          );
        })
      )}
    </div>
  );
}
