import {
  BadgePercent,
  Clock3,
  Flame,
  Goal,
  HeartCrack,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import type { Badge, BadgeKey } from "@/lib/hall-of-fame";
import { cn } from "@/lib/utils";

const BADGE_META: Record<
  BadgeKey,
  {
    icon: LucideIcon;
    iconClassName: string;
  }
> = {
  sniper: {
    icon: Target,
    iconClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  hotStreak: {
    icon: Flame,
    iconClassName: "bg-red-500/10 text-red-700 dark:text-red-300",
  },
  onForm: {
    icon: TrendingUp,
    iconClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  sharpshooter: {
    icon: BadgePercent,
    iconClassName: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  lastMinuteLarry: {
    icon: Clock3,
    iconClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  goalMachine: {
    icon: Goal,
    iconClassName: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
  theWall: {
    icon: Shield,
    iconClassName: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  },
  soClose: {
    icon: HeartCrack,
    iconClassName: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
};

function formatLeadTime(seconds: number, t: Awaited<ReturnType<typeof getTranslations>>) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return t("hallOfFame.leadTimeMinutes", { minutes });
}

function formatValue(
  badge: Badge,
  locale: string,
  t: Awaited<ReturnType<typeof getTranslations>>,
) {
  if (badge.value == null) return t("hallOfFame.notYetAwarded");

  switch (badge.key) {
    case "sniper":
      return t("hallOfFame.exactHits", { count: badge.value });
    case "hotStreak":
      return t("hallOfFame.streakMatches", { count: badge.value });
    case "onForm":
      return t("hallOfFame.pointsLast5", { points: badge.value });
    case "sharpshooter":
      return t("hallOfFame.hitRatePercent", {
        percent: Math.round(badge.value * 100),
      });
    case "lastMinuteLarry":
      return formatLeadTime(badge.value, t);
    case "goalMachine":
    case "theWall": {
      const goals = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(badge.value / 100);
      return t("hallOfFame.averageGoals", { goals });
    }
    case "soClose":
      return t("hallOfFame.marginHits", { count: badge.value });
  }
}

export async function HallOfFame({
  badges,
  locale,
}: {
  badges: Badge[];
  locale: string;
}) {
  const t = await getTranslations("leaderboard");
  const hasAnyHolder = badges.some((badge) => badge.holderUserId != null);

  if (!hasAnyHolder) {
    return (
      <EmptyState
        icon={<Trophy className="size-8" aria-hidden />}
        title={t("hallOfFame.emptyTitle")}
        description={t("hallOfFame.emptyDescription")}
      />
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold tracking-normal">
          {t("hallOfFame.title")}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => {
          const meta = BADGE_META[badge.key];
          const Icon = meta.icon;
          const awarded = badge.holderName != null;

          return (
            <Card
              key={badge.key}
              size="sm"
              className={cn(
                "min-h-44 justify-between rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md",
                awarded ? "shadow-sm" : "border-dashed opacity-75",
              )}
            >
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "wc-trophy relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg",
                      awarded ? meta.iconClassName : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {awarded ? <span className="wc-trophy__shine" aria-hidden /> : null}
                  </span>
                  <UiBadge
                    variant={awarded ? "secondary" : "outline"}
                    className={cn(
                      "max-w-28 truncate sm:max-w-36",
                      awarded && "border-transparent bg-gold/20 text-gold-foreground",
                    )}
                  >
                    {formatValue(badge, locale, t)}
                  </UiBadge>
                </div>
                <div className="space-y-1">
                  <CardTitle>{t(`hallOfFame.${badge.key}Title`)}</CardTitle>
                  <CardDescription>
                    {t(`hallOfFame.${badge.key}Desc`)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {badge.holderName ? (
                    <>
                      <Avatar
                        src={badge.holderAvatarUrl}
                        name={badge.holderName}
                        className="size-8 text-xs"
                      />
                      <span className="min-w-0 truncate text-sm font-semibold">
                        {badge.holderName}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("hallOfFame.notYetAwarded")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
