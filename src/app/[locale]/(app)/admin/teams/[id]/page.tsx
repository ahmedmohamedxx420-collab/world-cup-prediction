import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/teams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeamForm } from "../team-form";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const team = await getTeam(numId);
  if (!team) notFound();

  const t = await getTranslations("admin.teams");

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t("editTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <TeamForm team={team} />
      </CardContent>
    </Card>
  );
}
