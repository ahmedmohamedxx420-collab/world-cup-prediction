import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { LiveBadge } from "@/components/live-badge";
import { LocalKickoff } from "@/components/local-kickoff";
import { MatchBanner } from "@/components/match-banner";
import { CrowdInsights } from "@/components/crowd-insights";
import { GoalBurst } from "@/components/goal-burst";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { getAppSettings } from "@/lib/app-settings";
import { computeCrowdInsights } from "@/lib/crowd-insights";
import { getMatch } from "@/lib/matches";
import type { Match } from "@/lib/match-types";
import {
  formatScoreline,
  isolateScoreline,
  sideLabel,
} from "@/lib/match-format";
import { ScoringDisclosure } from "@/components/scoring-legend";
import {
  getMatchPredictions,
  getMyPrediction,
  type PredictionWithProfile,
} from "@/lib/predictions";
import { getCurrentUser } from "@/lib/profile";
import { listTeams } from "@/lib/teams";
import { cn } from "@/lib/utils";
import { PredictForm } from "./predict-form";

function scoreText(match: Match) {
  return formatScoreline(match.home_score, match.away_score);
}

function isTbd(match: Match) {
  return match.home_team_id == null || match.away_team_id == null;
}

function isFinished(match: Match) {
  return match.status === "finished" || (match.status !== "live" && scoreText(match) != null);
}

function isLiveMatch(match: Match, now: number) {
  return (
    !isTbd(match) &&
    !isFinished(match) &&
    (match.status === "live" || Date.parse(match.kickoff_at) <= now)
  );
}

async function getServerNow() {
  return Date.now();
}

function RevealList({
  predictions,
  myUserId,
  result,
  t,
}: {
  predictions: PredictionWithProfile[];
  myUserId: string | undefined;
  result: string | null;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card/95 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t("revealTitle")}</h2>
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {result
            ? t("actualResult", { score: isolateScoreline(result) })
            : t("resultPending")}
        </span>
      </div>

      <ul className="space-y-2">
        {predictions.map((prediction) => {
          const mine = prediction.user_id === myUserId;
          const displayName =
            prediction.profile?.full_name ?? t("unknownMember");

          return (
            <li key={prediction.id}>
              <Link
                href={`/leaderboard/${prediction.user_id}`}
                className={cn(
                  "wc-fixture-card flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  mine
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                    : "bg-card hover:bg-muted/40",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar
                    src={prediction.profile?.avatar_url}
                    name={displayName}
                    className="size-9"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {displayName}
                      {mine ? ` ${t("you")}` : ""}
                    </span>
                    {prediction.points_awarded == null ? (
                      <span className="block text-xs text-muted-foreground">
                        {t("pointsPending")}
                      </span>
                    ) : (
                      <span className="mt-0.5 inline-flex items-center rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold tabular-nums text-gold-foreground">
                        {t("points", { points: prediction.points_awarded })}
                      </span>
                    )}
                  </span>
                </span>
                <span
                  className="shrink-0 text-lg font-bold tabular-nums"
                  dir="ltr"
                >
                  {formatScoreline(prediction.home_score, prediction.away_score)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function FixtureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const matchId = Number(id);
  if (!Number.isInteger(matchId)) notFound();

  const [match, teams, myPrediction, visiblePredictions, user, settings] =
    await Promise.all([
      getMatch(matchId),
      listTeams(),
      getMyPrediction(matchId),
      getMatchPredictions(matchId),
      getCurrentUser(),
      getAppSettings(),
    ]);

  if (!match) notFound();

  const [t, fixturesT, stagesT, now] = await Promise.all([
    getTranslations("predict"),
    getTranslations("fixtures"),
    getTranslations("admin.fixtures.stages"),
    getServerNow(),
  ]);

  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const homeName = sideLabel(
    teamMap,
    match.home_team_id,
    match.home_label,
    fixturesT("tbd"),
    locale,
  );
  const awayName = sideLabel(
    teamMap,
    match.away_team_id,
    match.away_label,
    fixturesT("tbd"),
    locale,
  );
  const lockedHint = Date.parse(match.kickoff_at) <= now;
  const tbd = isTbd(match);
  const result = scoreText(match);
  const finishedMatch = isFinished(match);
  const inProgress = isLiveMatch(match, now);
  const hasOtherVisiblePrediction = visiblePredictions.some(
    (prediction) => prediction.user_id !== user?.id,
  );
  const showReveal =
    visiblePredictions.length > 0 &&
    (lockedHint || inProgress || hasOtherVisiblePrediction);

  // Aggregate, privacy-safe "what did the family vote" insights, computed only
  // from already-visible (post-kickoff) predictions. Hidden before kickoff.
  const insights = showReveal
    ? computeCrowdInsights(visiblePredictions, match, settings)
    : null;

  // Celebrate when the viewer's own saved prediction matched the exact result.
  const exactHit =
    finishedMatch &&
    result != null &&
    myPrediction != null &&
    myPrediction.home_score === match.home_score &&
    myPrediction.away_score === match.away_score;

  const pills =
    "rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold tabular-nums";

  return (
    <div className="space-y-6">
      <BackLink href="/fixtures" label={t("back")} />

      <MatchBanner
        homeName={homeName}
        awayName={awayName}
        homeFlag={teamMap.get(match.home_team_id ?? -1)?.flag}
        awayFlag={teamMap.get(match.away_team_id ?? -1)?.flag}
        centerLabel={result ?? fixturesT("vs")}
        centerLabelDirection={result ? "ltr" : "auto"}
        venue={match.venue}
        topStart={
          <>
            {match.match_number != null ? (
              <span className={pills}>
                {fixturesT("matchNumber", { number: match.match_number })}
              </span>
            ) : null}
            <span className={pills}>{stagesT(match.stage)}</span>
            {match.group_letter ? (
              <span className={pills}>
                {fixturesT("group", { group: match.group_letter })}
              </span>
            ) : null}
          </>
        }
        topEnd={
          inProgress ? (
            <LiveBadge label={fixturesT("inProgress")} />
          ) : (
            <span className="text-xs font-semibold text-white/90">
              <LocalKickoff
                iso={match.kickoff_at}
                locale={locale}
                closesLabel={fixturesT("closesAtKickoff")}
                lockedLabel={fixturesT("locked")}
              />
            </span>
          )
        }
      />

      {exactHit ? (
        <GoalBurst word={t("celebrateWord")} subtitle={t("celebrateExact")} />
      ) : null}

      {tbd ? (
        <p className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground">
          {t("tbdLocked")}
        </p>
      ) : (
        <PredictForm
          matchId={match.id}
          kickoffAt={match.kickoff_at}
          homeName={homeName}
          awayName={awayName}
          initialHomeScore={myPrediction?.home_score ?? 0}
          initialAwayScore={myPrediction?.away_score ?? 0}
          hasPrediction={Boolean(myPrediction)}
          lockedHint={lockedHint}
          tbd={tbd}
        />
      )}

      {!finishedMatch && !tbd ? (
        <ScoringDisclosure
          points={{
            exact: settings.exact_points,
            margin: settings.goal_diff_points,
            winner: settings.winner_points,
          }}
        />
      ) : null}

      {insights ? (
        <CrowdInsights
          insights={insights}
          homeName={homeName}
          awayName={awayName}
          result={result}
        />
      ) : null}

      {showReveal ? (
        <RevealList
          predictions={visiblePredictions}
          myUserId={user?.id}
          result={result}
          t={t}
        />
      ) : null}
    </div>
  );
}
