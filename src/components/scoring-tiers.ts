import { Check, MoveHorizontal, Target, X, type LucideIcon } from "lucide-react";
import type { ScoreTier } from "@/lib/scoring";

// Shared visual vocabulary for the four scoring tiers, reused by the scoring
// legend and the per-match results badges so colours/icons never drift apart.
// Tones match the form dots: exact = lime, margin = gold, winner = primary
// (green), miss = muted. Lucide icons render fine in server components.
export type TierStyle = {
  icon: LucideIcon;
  dot: string;
  soft: string;
  num: string;
};

export const TIER_META: Record<ScoreTier, TierStyle> = {
  exact: {
    icon: Target,
    dot: "bg-lime",
    soft: "border-lime/45 bg-lime/15",
    num: "text-foreground",
  },
  margin: {
    icon: MoveHorizontal,
    dot: "bg-gold",
    soft: "border-gold/45 bg-gold/15",
    num: "text-foreground",
  },
  winner: {
    icon: Check,
    dot: "bg-primary",
    soft: "border-primary/35 bg-primary/10",
    num: "text-foreground",
  },
  miss: {
    icon: X,
    dot: "bg-muted-foreground/40",
    soft: "border-border bg-muted",
    num: "text-muted-foreground",
  },
};
