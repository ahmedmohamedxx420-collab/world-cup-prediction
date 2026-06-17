import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getMatch } from "@/lib/matches";
import { listTeams } from "@/lib/teams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FixtureForm } from "../fixture-form";

export default async function EditFixturePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const [fixture, teams] = await Promise.all([getMatch(numId), listTeams()]);
  if (!fixture) notFound();

  const t = await getTranslations("admin.fixtures");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t("editTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <FixtureForm teams={teams} fixture={fixture} />
      </CardContent>
    </Card>
  );
}
