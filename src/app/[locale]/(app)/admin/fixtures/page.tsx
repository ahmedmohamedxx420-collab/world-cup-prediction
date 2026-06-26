import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/empty-state";
import { ToastFlash } from "@/components/toast-flash";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listMatches, MATCH_STAGES } from "@/lib/matches";
import { listTeams } from "@/lib/teams";
import {
  formatKickoffUtc,
  formatScoreline,
  sideName,
} from "@/lib/match-format";

export default async function AdminFixturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [matches, teams] = await Promise.all([listMatches(), listTeams()]);
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const t = await getTranslations("admin.fixtures");
  const stagesT = await getTranslations("admin.fixtures.stages");

  const grouped = MATCH_STAGES.map((stage) => ({
    stage,
    items: matches.filter((match) => match.stage === stage),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6">
      <ToastFlash />

      <div className="flex justify-end">
        <Link
          href="/admin/fixtures/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          {t("add")}
        </Link>
      </div>

      {matches.length === 0 ? (
        <EmptyState title={t("empty")} className="py-10" />
      ) : (
        grouped.map(({ stage, items }) => (
          <section key={stage} className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {stagesT(stage)}
            </h2>
            <ul className="divide-y rounded-lg border">
              {items.map((match) => {
                const scoreline = formatScoreline(
                  match.home_score,
                  match.away_score,
                );

                return (
                  <li key={match.id}>
                    <Link
                      href={`/admin/fixtures/${match.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50"
                    >
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium [direction:ltr]">
                          <span className="truncate" dir="auto">
                            {sideName(
                              teamMap,
                              match.home_team_id,
                              match.home_label,
                              t("tbd"),
                              locale,
                            )}
                          </span>
                          <span className="shrink-0" dir="auto">
                            {t("vs")}
                          </span>
                          <span className="truncate" dir="auto">
                            {sideName(
                              teamMap,
                              match.away_team_id,
                              match.away_label,
                              t("tbd"),
                              locale,
                            )}
                          </span>
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {match.group_letter ? `${match.group_letter} · ` : ""}
                          {formatKickoffUtc(match.kickoff_at, locale)}
                          {match.venue ? ` · ${match.venue}` : ""}
                        </span>
                      </span>
                      {scoreline ? (
                        <span
                          className="shrink-0 text-sm font-medium tabular-nums"
                          dir="ltr"
                        >
                          {scoreline}
                        </span>
                      ) : null}
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
