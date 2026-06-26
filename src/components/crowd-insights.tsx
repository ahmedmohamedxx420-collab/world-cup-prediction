import { getTranslations } from "next-intl/server";
import {
  CircleAlert,
  CircleCheck,
  Crown,
  Flame,
  Scale,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import type {
  CrowdInsights as CrowdInsightsData,
  InsightMember,
  Outcome,
} from "@/lib/crowd-insights";
import { formatScoreline, isolateScoreline } from "@/lib/match-format";
import { cn } from "@/lib/utils";

const cardClass = "wc-fixture-card space-y-3 rounded-2xl border bg-card/95 p-4 shadow-sm";
const sectionHeading = "flex items-center gap-2 text-sm font-semibold";

export async function CrowdInsights({
  insights,
  homeName,
  awayName,
  result,
}: {
  insights: CrowdInsightsData;
  homeName: string;
  awayName: string;
  result: string | null;
}) {
  const t = await getTranslations("predict");

  const outcomeLabel = (outcome: Outcome) =>
    outcome === "home" ? homeName : outcome === "away" ? awayName : t("draw");
  const memberName = (member: InsightMember) =>
    member.name ?? t("unknownMember");

  const { verdict, topScorelines, average, calledIt, bullseye, podium, loneWolf, boldest } =
    insights;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Users className="size-4 text-primary" />
        <h2 className="text-base font-semibold">{t("insightsTitle")}</h2>
      </div>

      {/* Family verdict — winner split */}
      <section className={cardClass}>
        <h3 className={sectionHeading}>
          <Scale className="size-4 text-muted-foreground" />
          {t("verdictTitle")}
        </h3>
        <div className="flex h-3 w-full overflow-hidden rounded-full border bg-muted">
          <span className="bg-primary" style={{ width: `${verdict.home.pct}%` }} />
          <span
            className="bg-muted-foreground/40"
            style={{ width: `${verdict.draw.pct}%` }}
          />
          <span className="bg-gold" style={{ width: `${verdict.away.pct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
          <VerdictLeg
            align="start"
            dot="bg-primary"
            label={homeName}
            count={verdict.home.count}
            pct={verdict.home.pct}
            t={t}
          />
          <VerdictLeg
            align="center"
            dot="bg-muted-foreground/40"
            label={t("draw")}
            count={verdict.draw.count}
            pct={verdict.draw.pct}
            t={t}
          />
          <VerdictLeg
            align="end"
            dot="bg-gold"
            label={awayName}
            count={verdict.away.count}
            pct={verdict.away.pct}
            t={t}
          />
        </div>
        {verdict.favorite ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Crown className="size-3.5 text-gold" />
            {t("crowdFavorite", { pick: outcomeLabel(verdict.favorite) })}
          </p>
        ) : null}
      </section>

      {/* Most predicted scoreline + family average */}
      <section className={cardClass}>
        <h3 className={sectionHeading}>
          <Target className="size-4 text-muted-foreground" />
          {t("scorelineTitle")}
        </h3>
        <ul className="space-y-1.5">
          {topScorelines.map((row) => (
            <li
              key={row.score}
              className="flex items-center gap-3 [direction:ltr]"
            >
              <span
                className="inline-flex min-w-12 justify-center rounded-lg bg-muted px-2.5 py-1 text-sm font-bold tabular-nums"
                dir="ltr"
              >
                {row.score}
              </span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="absolute inset-y-0 start-0 rounded-full bg-primary/70"
                  style={{ width: `${row.pct}%` }}
                />
              </span>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                {t("scorelineMeta", { count: row.count, pct: row.pct })}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs font-medium text-muted-foreground">
          {t("averageLine", {
            score: formatScoreline(average.home, average.away, {
              isolate: true,
            }),
            goals: average.total,
          })}
        </p>
      </section>

      {/* Did the family call it? */}
      {calledIt ? (
        <section
          className={cn(
            cardClass,
            calledIt.status === "nailed"
              ? "border-gold/40 bg-gold/10"
              : calledIt.status === "fooled"
                ? "border-destructive/30 bg-destructive/5"
                : "",
          )}
        >
          <h3 className={sectionHeading}>
            {calledIt.status === "nailed" ? (
              <CircleCheck className="size-4 text-gold" />
            ) : calledIt.status === "fooled" ? (
              <CircleAlert className="size-4 text-destructive" />
            ) : (
              <Scale className="size-4 text-muted-foreground" />
            )}
            {t(`calledIt.${calledIt.status}.title`)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(`calledIt.${calledIt.status}.body`, {
              pick: verdict.favorite ? outcomeLabel(verdict.favorite) : "",
              actual: outcomeLabel(calledIt.actual),
              score: isolateScoreline(result) ?? "",
            })}
          </p>
        </section>
      ) : null}

      {/* Match podium */}
      {podium && podium.length > 0 ? (
        <section className={cardClass}>
          <h3 className={sectionHeading}>
            <Trophy className="size-4 text-gold" />
            {t("podiumTitle")}
          </h3>
          <ol className="space-y-2">
            {podium.map((entry, index) => (
              <li
                key={index}
                className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                    index === 0
                      ? "bg-gold/25 text-gold-foreground"
                      : index === 1
                        ? "bg-muted-foreground/20 text-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <Avatar
                  src={entry.member.avatar}
                  name={memberName(entry.member)}
                  className="size-8"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {memberName(entry.member)}
                </span>
                <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold tabular-nums text-gold-foreground">
                  {t("points", { points: entry.points })}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Bullseye club */}
      {bullseye ? (
        <section className={cardClass}>
          <h3 className={sectionHeading}>
            <Target className="size-4 text-primary" />
            {t("bullseyeTitle")}
          </h3>
          {bullseye.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {bullseye.map((member, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 rounded-full border bg-primary/5 py-1 pe-3 ps-1"
                >
                  <Avatar
                    src={member.avatar}
                    name={memberName(member)}
                    className="size-7"
                  />
                  <span className="text-xs font-semibold">
                    {memberName(member)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("bullseyeEmpty")}</p>
          )}
        </section>
      ) : null}

      {/* Fun superlatives */}
      {loneWolf || (podium && boldest) ? (
        <section className={cardClass}>
          {loneWolf ? (
            <p className="flex items-center gap-2 text-sm">
              <Crown className="size-4 shrink-0 text-gold" />
              <span>
                <span className="font-semibold">{t("loneWolfTitle")} · </span>
                {t("loneWolf", {
                  name: memberName(loneWolf.member),
                  pick: outcomeLabel(loneWolf.outcome),
                })}
              </span>
            </p>
          ) : null}
          {podium && boldest ? (
            <p className="flex items-center gap-2 text-sm">
              <Flame className="size-4 shrink-0 text-destructive" />
              <span>
                <span className="font-semibold">{t("boldestTitle")} · </span>
                {t("boldest", {
                  name: memberName(boldest.member),
                  score: isolateScoreline(boldest.score),
                })}
              </span>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function VerdictLeg({
  align,
  dot,
  label,
  count,
  pct,
  t,
}: {
  align: "start" | "center" | "end";
  dot: string;
  label: string;
  count: number;
  pct: number;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        align === "center"
          ? "items-center text-center"
          : align === "end"
            ? "items-end text-end"
            : "items-start text-start",
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className={cn("size-2 shrink-0 rounded-full", dot)} />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-muted-foreground tabular-nums">
        {t("verdictLeg", { pct, count })}
      </span>
    </div>
  );
}
