import { getTranslations, setRequestLocale } from "next-intl/server";
import { listTeams } from "@/lib/teams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FixtureForm } from "../fixture-form";

export default async function NewFixturePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const teams = await listTeams();
  const t = await getTranslations("admin.fixtures");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t("addTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <FixtureForm teams={teams} />
      </CardContent>
    </Card>
  );
}
