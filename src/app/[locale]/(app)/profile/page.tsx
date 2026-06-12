import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, getProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "./actions";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { locale } = await params;
  const { saved } = await searchParams;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const profile = await getProfile();
  if (!profile) {
    redirect({ href: "/onboarding", locale });
    return null;
  }

  const t = await getTranslations("profile");

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {saved === "1" ? (
          <p
            className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground"
            role="status"
          >
            {t("saved")}
          </p>
        ) : null}
        <ProfileForm fullName={profile.full_name} locale={profile.locale} />
      </CardContent>
      <CardFooter>
        <form action={signOut} className="w-full">
          <Button className="w-full" type="submit" variant="destructive">
            {t("signOut")}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
