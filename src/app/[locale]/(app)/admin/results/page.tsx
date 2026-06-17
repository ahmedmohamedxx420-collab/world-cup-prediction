import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/empty-state";
import { ToastFlash } from "@/components/toast-flash";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sideName, formatKickoffUtc } from "@/lib/match-format";
import { listMatches } from "@/lib/matches";
import { listTeams } from "@/lib/teams";
import { ResultForm } from "./result-form";

export default async function AdminResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [matches, teams] = await Promise.all([listMatches(), listTeams()]);
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const t = await getTranslations("admin.results");
  const f = await getTranslations("admin.fixtures");

  // Most recent kickoff first; results are entered after a match is played.
  const ordered = [...matches].reverse();

  return (
    <div className="space-y-4">
      <ToastFlash />

      {matches.length === 0 ? (
        <EmptyState title={t("empty")} className="py-10" />
      ) : (
        ordered.map((match) => {
          const teamOptions =
            match.home_team_id != null && match.away_team_id != null
              ? [
                  {
                    id: match.home_team_id,
                    name: teamMap.get(match.home_team_id)?.name_en ?? "",
                  },
                  {
                    id: match.away_team_id,
                    name: teamMap.get(match.away_team_id)?.name_en ?? "",
                  },
                ]
              : [];

          return (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="text-sm">
                  {sideName(
                    teamMap,
                    match.home_team_id,
                    match.home_label,
                    f("tbd"),
                  )}{" "}
                  {f("vs")}{" "}
                  {sideName(
                    teamMap,
                    match.away_team_id,
                    match.away_label,
                    f("tbd"),
                  )}
                </CardTitle>
                <CardDescription>
                  {formatKickoffUtc(match.kickoff_at, locale)}
                  {match.status === "finished" ? ` - ${t("scored")}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResultForm
                  matchId={match.id}
                  homeScore={match.home_score}
                  awayScore={match.away_score}
                  shootoutWinnerId={match.shootout_winner_team_id}
                  teamOptions={teamOptions}
                />
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
