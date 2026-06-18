"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CircleAlert, Loader2, Lock, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { savePrediction, type PredictionFormState } from "./actions";

type SaveStatus = "idle" | "saving" | "saved" | "locked" | "error";

function clampScore(value: number) {
  return Math.min(99, Math.max(0, value));
}

function kickoffHasPassed(iso: string) {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? false : Date.now() >= time;
}

function ScoreStepper({
  label,
  value,
  disabled,
  increaseLabel,
  decreaseLabel,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  increaseLabel: string;
  decreaseLabel: string;
  onChange: (nextValue: number) => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="truncate text-center text-sm font-semibold">{label}</div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button
          type="button"
          size="icon-lg"
          variant="outline"
          aria-label={decreaseLabel}
          disabled={disabled || value <= 0}
          onClick={() => onChange(clampScore(value - 1))}
        >
          <Minus aria-hidden />
        </Button>
        <output className="min-w-16 text-center text-4xl font-semibold tabular-nums">
          {value}
        </output>
        <Button
          type="button"
          size="icon-lg"
          variant="outline"
          aria-label={increaseLabel}
          disabled={disabled || value >= 99}
          onClick={() => onChange(clampScore(value + 1))}
        >
          <Plus aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function PredictForm({
  matchId,
  kickoffAt,
  homeName,
  awayName,
  initialHomeScore,
  initialAwayScore,
  hasPrediction,
  lockedHint,
  tbd,
}: {
  matchId: number;
  kickoffAt: string;
  homeName: string;
  awayName: string;
  initialHomeScore: number;
  initialAwayScore: number;
  hasPrediction: boolean;
  lockedHint: boolean;
  tbd: boolean;
}) {
  const t = useTranslations("predict");
  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [hasSavedPrediction, setHasSavedPrediction] = useState(hasPrediction);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [locked, setLocked] = useState(lockedHint);
  const [status, setStatus] = useState<SaveStatus>(
    lockedHint ? "locked" : "idle",
  );
  const [error, setError] =
    useState<PredictionFormState["error"]>(undefined);
  // Bumped on every successful save so the "saved" pill re-mounts and replays
  // its pop animation even when two saves land back-to-back.
  const [savedTick, setSavedTick] = useState(0);
  const saveIdRef = useRef(0);

  useEffect(() => {
    const updateLock = () => setLocked(kickoffHasPassed(kickoffAt));
    updateLock();

    const interval = window.setInterval(updateLock, 30_000);
    return () => window.clearInterval(interval);
  }, [kickoffAt]);

  useEffect(() => {
    if (!hasInteracted || locked || tbd) return;

    const timer = window.setTimeout(async () => {
      const saveId = saveIdRef.current + 1;
      saveIdRef.current = saveId;
      setStatus("saving");
      setError(undefined);

      const formData = new FormData();
      formData.set("match_id", String(matchId));
      formData.set("home_score", String(homeScore));
      formData.set("away_score", String(awayScore));

      try {
        const result = await savePrediction({}, formData);
        if (saveIdRef.current !== saveId) return;

        if (result.saved) {
          setHasSavedPrediction(true);
          setStatus("saved");
          setSavedTick((tick) => tick + 1);
          return;
        }

        if (result.error === "locked") {
          setLocked(true);
          setStatus("locked");
          return;
        }

        setError(result.error ?? "generic");
        setStatus("error");
      } catch {
        if (saveIdRef.current !== saveId) return;
        setError("generic");
        setStatus("error");
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [awayScore, hasInteracted, homeScore, locked, matchId, tbd]);

  const disabled = locked || tbd;

  const updateHome = (nextValue: number) => {
    setHomeScore(nextValue);
    setHasInteracted(true);
    setStatus("idle");
    setError(undefined);
  };

  const updateAway = (nextValue: number) => {
    setAwayScore(nextValue);
    setHasInteracted(true);
    setStatus("idle");
    setError(undefined);
  };

  if (locked && !hasSavedPrediction) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-lg border bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground"
      >
        {t("lockedNoPrediction")}
      </p>
    );
  }

  const effectiveStatus = locked ? "locked" : status;

  const indicator = {
    idle: {
      icon: null,
      text: t("closesAtKickoff"),
      className: "bg-muted/50 text-muted-foreground",
    },
    saving: {
      icon: <Loader2 className="size-4 animate-spin" aria-hidden />,
      text: t("saving"),
      className: "bg-muted text-muted-foreground",
    },
    saved: {
      icon: <Check className="size-4" aria-hidden />,
      text: t("saved"),
      className: "bg-primary/15 text-primary ring-1 ring-primary/25",
    },
    locked: {
      icon: <Lock className="size-4" aria-hidden />,
      text: t("locked"),
      className: "bg-muted text-muted-foreground",
    },
    error: {
      icon: <CircleAlert className="size-4" aria-hidden />,
      text: t(`errors.${error ?? "generic"}`),
      className: "bg-destructive/10 text-destructive",
    },
  }[effectiveStatus];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreStepper
          label={homeName}
          value={homeScore}
          disabled={disabled}
          increaseLabel={t("increase", { team: homeName })}
          decreaseLabel={t("decrease", { team: homeName })}
          onChange={updateHome}
        />
        <ScoreStepper
          label={awayName}
          value={awayScore}
          disabled={disabled}
          increaseLabel={t("increase", { team: awayName })}
          decreaseLabel={t("decrease", { team: awayName })}
          onChange={updateAway}
        />
      </div>

      <div role="status" aria-live="polite" className="flex justify-center">
        <span
          key={
            effectiveStatus === "saved" ? `saved-${savedTick}` : effectiveStatus
          }
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            indicator.className,
            effectiveStatus === "saved"
              ? "duration-300 animate-in fade-in zoom-in-50"
              : null,
          )}
        >
          {indicator.icon}
          <span>{indicator.text}</span>
        </span>
      </div>
    </div>
  );
}
