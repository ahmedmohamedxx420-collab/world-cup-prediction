import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { formatKickoffUtc } from "@/lib/match-format";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SyncButtons } from "./sync-buttons";

type SyncRun = {
  id: string;
  kind: "schedule" | "results";
  ran_at: string;
  ok: boolean;
  fixtures_upserted: number | null;
  error: string | null;
};

export default async function AdminSyncPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("sync_runs")
    .select("id, kind, ran_at, ok, fixtures_upserted, error")
    .order("ran_at", { ascending: false })
    .limit(8);
  const runs = (data ?? []) as SyncRun[];

  const t = await getTranslations("admin.sync");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SyncButtons />
          <p className="text-xs text-muted-foreground">{t("note")}</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {t("lastSync")}
        </h2>
        {runs.length === 0 ? (
          <EmptyState title={t("never")} className="py-10" />
        ) : (
          <ul className="divide-y rounded-lg border">
            {runs.map((run) => (
              <li
                key={run.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className={run.ok ? "text-primary" : "text-destructive"}>
                    {run.ok ? t("ok") : t("failed")}
                  </span>
                  <span className="text-muted-foreground">
                    {run.kind === "schedule" ? t("kindSchedule") : t("kindResults")}
                  </span>
                </span>
                <span className="min-w-0 text-end text-xs text-muted-foreground">
                  <span className="block">{formatKickoffUtc(run.ran_at, locale)}</span>
                  <span className="block truncate">
                    {run.ok
                      ? t("fixtures", { count: run.fixtures_upserted ?? 0 })
                      : run.error}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
