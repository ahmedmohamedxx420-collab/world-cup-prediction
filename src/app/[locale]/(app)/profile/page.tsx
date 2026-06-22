import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getLeaderboard } from "@/lib/leaderboard";
import { getCurrentUser, getProfile } from "@/lib/profile";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToastFlash } from "@/components/toast-flash";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { signOut } from "./actions";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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

  const [t, leaderboardT, leaderboard] = await Promise.all([
    getTranslations("profile"),
    getTranslations("leaderboard"),
    getLeaderboard(),
  ]);
  const myStats = leaderboard.find((row) => row.user_id === user.id);

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      <ToastFlash />

      {myStats ? (
        <Card size="sm" className="wc-fixture-card bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>{leaderboardT("profileStatsTitle")}</CardTitle>
            <CardDescription>
              {leaderboardT("profileStatsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted/40 px-3 py-2">
                <span className="block text-xs text-muted-foreground">
                  {leaderboardT("rank")}
                </span>
                <span className="text-xl font-black tabular-nums">
                  {myStats.rank}
                </span>
              </div>
              <div className="rounded-xl bg-gold/15 px-3 py-2">
                <span className="block text-xs text-muted-foreground">
                  {leaderboardT("points")}
                </span>
                <span className="text-xl font-black tabular-nums">
                  {myStats.total_points}
                </span>
              </div>
              <div className="rounded-xl bg-lime/15 px-3 py-2">
                <span className="block text-xs text-muted-foreground">
                  {leaderboardT("exact")}
                </span>
                <span className="text-xl font-black tabular-nums">
                  {myStats.exact_count}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href="/leaderboard?tab=my-results"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              {leaderboardT("viewMyResults")}
            </Link>
          </CardFooter>
        </Card>
      ) : null}

      <Card className="wc-fixture-card bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileForm
            fullName={profile.full_name}
            avatarUrl={profile.avatar_url}
            locale={profile.locale}
          />
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <p className="font-semibold">{t("passwordResetTipTitle")}</p>
            <p className="mt-1 text-muted-foreground">
              {t("passwordResetTipBody")}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <form action={signOut} className="w-full">
            <Button className="w-full" type="submit" variant="destructive">
              {t("signOut")}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
