"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SCORE_TIERS, tierPoints, type ScoreTier, type TierPoints } from "@/lib/scoring";
import { TIER_META } from "@/components/scoring-tiers";

function useTierCopy() {
  const t = useTranslations("scoring");
  return (tier: ScoreTier) => ({
    title: t(`${tier}Title`),
    blurb: t(`${tier}Blurb`),
  });
}

// Collapsible "How points work" — the smallest footprint, for the predict page.
export function ScoringDisclosure({
  points,
  defaultOpen = false,
  className,
}: {
  points: TierPoints;
  defaultOpen?: boolean;
  className?: string;
}) {
  const t = useTranslations("scoring");
  const copy = useTierCopy();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        "rounded-2xl border bg-card/95 shadow-sm",
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold">
          <Info className="size-4 text-primary" aria-hidden />
          {t("title")}
        </span>
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="space-y-1.5 border-t px-4 pb-4 pt-3">
          {SCORE_TIERS.map((tier) => {
            const meta = TIER_META[tier];
            const { title, blurb } = copy(tier);
            return (
              <div key={tier} className="flex items-center gap-3 py-1">
                <span
                  className={cn("size-2.5 shrink-0 rounded-full", meta.dot)}
                  aria-hidden
                />
                <span className="text-sm font-semibold">{title}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {blurb}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums",
                    meta.soft,
                  )}
                >
                  {tierPoints(tier, points)}
                </span>
              </div>
            );
          })}
          <p className="pt-1 text-xs text-muted-foreground">{t("footnote")}</p>
        </div>
      ) : null}
    </section>
  );
}

// Ultra-compact 4-segment legend (7 / 4 / 2 / 0) — an at-a-glance key.
export function ScoringStrip({
  points,
  className,
}: {
  points: TierPoints;
  className?: string;
}) {
  const copy = useTierCopy();

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {SCORE_TIERS.map((tier) => {
        const meta = TIER_META[tier];
        const Icon = meta.icon;
        const { title } = copy(tier);
        return (
          <div
            key={tier}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center",
              meta.soft,
            )}
          >
            <span
              className={cn(
                "text-xl font-black leading-none tabular-nums",
                meta.num,
              )}
            >
              {tierPoints(tier, points)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold leading-tight">
              <Icon className="size-3" aria-hidden />
              {title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
