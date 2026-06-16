import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LocalKickoff } from "@/components/local-kickoff";
import { Link } from "@/i18n/navigation";
import { getMatch } from "@/lib/matches";
import type { Match } from "@/lib/match-types";
import { sideName } from "@/lib/match-format";
import { getMyPrediction } from "@/lib/predictions";
import { listTeams } from "@/lib/teams";
import { PredictForm } from "./predict-form";

function scoreText(match: Match) {
  if (match.home_score == null || match.away_score == null) return null;
  return `${match.home_score}-${match.away_score}`;
}

function isTbd(match: Match) {
  return match.home_team_id == null || match.away_team_id == null;
}

async function getServerNow() {
  return Date.now();
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

  const [match, teams, myPrediction] = await Promise.all([
    getMatch(matchId),
    listTeams(),
    getMyPrediction(matchId),
  ]);

  if (!match) notFound();

  const [t, fixturesT, stagesT, now] = await Promise.all([
    getTranslations("predict"),
    getTranslations("fixtures"),
    getTranslations("admin.fixtures.stages"),
    getServerNow(),
  ]);

  const teamMap = new Map(teams.map((team) => [team.id, team]));
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
  const lockedHint = Date.parse(match.kickoff_at) <= now;
  const tbd = isTbd(match);
  const result = scoreText(match);

  return (
    <div className="space-y-6">
      <Link
        href="/fixtures"
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {t("back")}
      </Link>

      <section className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {match.match_number != null ? (
              <span className="tabular-nums">
                {fixturesT("matchNumber", { number: match.match_number })}
              </span>
            ) : null}
            <span>{stagesT(match.stage)}</span>
            {match.group_letter ? (
              <span>{fixturesT("group", { group: match.group_letter })}</span>
            ) : null}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <h1 className="truncate text-start text-lg font-semibold sm:text-2xl">
              {homeName}
            </h1>
            <span className="rounded-lg bg-muted px-3 py-2 text-sm font-semibold tabular-nums text-muted-foreground">
              {result ?? fixturesT("vs")}
            </span>
            <h2 className="truncate text-start text-lg font-semibold sm:text-2xl">
              {awayName}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <LocalKickoff
            iso={match.kickoff_at}
            locale={locale}
            closesLabel={fixturesT("closesAtKickoff")}
            lockedLabel={fixturesT("locked")}
          />
          {match.venue ? <span>{match.venue}</span> : null}
        </div>
      </section>

      {tbd ? (
        <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground">
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
    </div>
  );
}
