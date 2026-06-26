import {
  BadgePercent,
  ChevronUp,
  Clock3,
  Crown,
  Flame,
  Goal,
  HeartCrack,
  Shield,
  Sparkle,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
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

type CrownedEffect = "sniper" | "onForm" | "sharpshooter";

type BadgeMeta = {
  icon: LucideIcon;
  iconClassName: string;
  effect?: CrownedEffect;
};

export const BADGE_META: Record<BadgeKey, BadgeMeta> = {
  sniper: {
    icon: Target,
    iconClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    effect: "sniper",
  },
  onForm: {
    icon: TrendingUp,
    iconClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    effect: "onForm",
  },
  sharpshooter: {
    icon: BadgePercent,
    iconClassName: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    effect: "sharpshooter",
  },
  hotStreak: {
    icon: Flame,
    iconClassName: "bg-red-500/10 text-red-700 dark:text-red-300",
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

// The three prestige badges get the full crowned treatment, in this order.
const CROWNED_KEYS: BadgeKey[] = ["sniper", "onForm", "sharpshooter"];

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

// Decorative placement for the sparkle/spark particles around a crowned avatar.
const SPARKLES: Array<{
  top?: string;
  bottom?: string;
  insetInlineStart?: string;
  insetInlineEnd?: string;
  size: number;
  delay: string;
}> = [
  { top: "-6px", insetInlineStart: "6px", size: 12, delay: "0s" },
  { top: "8px", insetInlineEnd: "-8px", size: 9, delay: "0.5s" },
  { bottom: "-4px", insetInlineStart: "14px", size: 10, delay: "1s" },
  { top: "20px", insetInlineStart: "-8px", size: 8, delay: "1.5s" },
];

const MOMENTUM_SPARKS = [
  { x: "30%", delay: "0s" },
  { x: "50%", delay: "0.4s" },
  { x: "70%", delay: "0.8s" },
  { x: "42%", delay: "1.2s" },
] as const;

function CrownedAvatar({
  effect,
  holderName,
  holderAvatarUrl,
}: {
  effect: CrownedEffect;
  holderName: string;
  holderAvatarUrl: string | null;
}) {
  return (
    <span className={cn("wc-crowned", `wc-crowned--${effect}`)}>
      <span className="wc-crowned__halo" aria-hidden />

      {effect === "sniper" ? (
        <>
          <span className="wc-reticle" aria-hidden />
          <span className="wc-reticle__glint" aria-hidden />
        </>
      ) : null}

      {effect === "onForm" ? (
        <>
          <span className="wc-momentum-trail" aria-hidden>
            {MOMENTUM_SPARKS.map((spark, index) => (
              <span
                key={index}
                className="wc-momentum-trail__spark"
                style={
                  {
                    "--wc-x": spark.x,
                    "--wc-delay": spark.delay,
                  } as CSSProperties
                }
              />
            ))}
          </span>
          <ChevronUp className="wc-momentum-chevron size-5" aria-hidden />
        </>
      ) : null}

      {effect === "sharpshooter" ? (
        <>
          <Crown className="wc-crown size-6" aria-hidden />
          {SPARKLES.map((sparkle, index) => (
            <Sparkle
              key={index}
              className="wc-sparkle"
              aria-hidden
              style={
                {
                  top: sparkle.top,
                  bottom: sparkle.bottom,
                  insetInlineStart: sparkle.insetInlineStart,
                  insetInlineEnd: sparkle.insetInlineEnd,
                  width: sparkle.size,
                  height: sparkle.size,
                  "--wc-delay": sparkle.delay,
                } as CSSProperties
              }
            />
          ))}
        </>
      ) : null}

      <Avatar
        src={holderAvatarUrl}
        name={holderName}
        className="wc-crowned__avatar size-16"
      />
    </span>
  );
}

function CrownedCard({
  badge,
  locale,
  t,
}: {
  badge: Badge;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const meta = BADGE_META[badge.key];
  const Icon = meta.icon;
  const awarded = badge.holderName != null;
  const effect = meta.effect ?? "sniper";

  return (
    <Card
      className={cn(
        "relative items-center gap-4 overflow-hidden rounded-2xl text-center transition-all hover:-translate-y-0.5 hover:shadow-lg",
        awarded
          ? "border-gold/40 bg-gradient-to-b from-gold/10 to-card shadow-gold"
          : "border-dashed opacity-80",
      )}
    >
      <CardHeader className="w-full justify-items-center gap-2 text-center">
        <span
          className={cn(
            "wc-trophy relative flex size-11 items-center justify-center overflow-hidden rounded-xl",
            awarded ? meta.iconClassName : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden />
          {awarded ? <span className="wc-trophy__shine" aria-hidden /> : null}
        </span>
        <CardTitle className="text-base">
          {t(`hallOfFame.${badge.key}Title`)}
        </CardTitle>
        <UiBadge
          variant={awarded ? "secondary" : "outline"}
          className={cn(
            awarded && "border-transparent bg-gold/25 text-gold-foreground",
          )}
        >
          {formatValue(badge, locale, t)}
        </UiBadge>
      </CardHeader>

      <CardContent className="flex w-full flex-col items-center gap-3 pb-1">
        {badge.holderName ? (
          <>
            <CrownedAvatar
              effect={effect}
              holderName={badge.holderName}
              holderAvatarUrl={badge.holderAvatarUrl}
            />
            <span className="max-w-full truncate text-base font-bold">
              {badge.holderName}
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 py-3 text-sm font-medium text-muted-foreground">
            <span className="flex size-16 items-center justify-center rounded-full border border-dashed bg-muted/40">
              <Trophy className="size-6 opacity-50" aria-hidden />
            </span>
            {t("hallOfFame.notYetAwarded")}
          </span>
        )}
        <CardDescription className="text-xs">
          {t(`hallOfFame.${badge.key}Desc`)}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function StandardCard({
  badge,
  locale,
  t,
}: {
  badge: Badge;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const meta = BADGE_META[badge.key];
  const Icon = meta.icon;
  const awarded = badge.holderName != null;

  return (
    <Card
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
          <CardDescription>{t(`hallOfFame.${badge.key}Desc`)}</CardDescription>
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

  const byKey = new Map(badges.map((badge) => [badge.key, badge]));
  const crownedBadges = CROWNED_KEYS.map((key) => byKey.get(key)).filter(
    (badge): badge is Badge => badge != null,
  );
  const standardBadges = badges.filter(
    (badge) => !CROWNED_KEYS.includes(badge.key),
  );

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <span className="wc-page-kicker">
          <Sparkles className="size-4" aria-hidden />
          {t("hallOfFame.title")}
        </span>
        <p className="text-sm text-muted-foreground">
          {t("hallOfFame.description")}
        </p>
      </div>

      {crownedBadges.length > 0 ? (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-gold-foreground/90 uppercase">
            <Crown className="size-4 text-gold" aria-hidden />
            {t("hallOfFame.crownedTitle")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {crownedBadges.map((badge) => (
              <CrownedCard
                key={badge.key}
                badge={badge}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        </div>
      ) : null}

      {standardBadges.length > 0 ? (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            <Trophy className="size-4" aria-hidden />
            {t("hallOfFame.moreTitle")}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {standardBadges.map((badge) => (
              <div
                key={badge.key}
                className="w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]"
              >
                <StandardCard badge={badge} locale={locale} t={t} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
