import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listTeams } from "@/lib/teams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { ToastFlash } from "@/components/toast-flash";
import { TeamForm } from "./team-form";

export default async function AdminTeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const teams = await listTeams();
  const t = await getTranslations("admin.teams");

  return (
    <div className="space-y-6">
      <ToastFlash />

      <Card>
        <CardHeader>
          <CardTitle>{t("addTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamForm />
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {t("count", { count: teams.length })}
        </p>

        {teams.length === 0 ? (
          <EmptyState title={t("empty")} className="py-10" />
        ) : (
          <ul className="divide-y rounded-lg border">
            {teams.map((team) => (
              <li key={team.id}>
                <Link
                  href={`/admin/teams/${team.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{team.flag ?? "🏳️"}</span>
                    <span className="font-medium">{team.name_en}</span>
                    <span className="text-muted-foreground">{team.name_ar}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {team.code}
                    {team.group_letter ? ` · ${team.group_letter}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
