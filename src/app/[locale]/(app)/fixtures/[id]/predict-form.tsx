"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CircleAlert, Crown, Lock, Minus, Plus, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { BallLoader } from "@/components/ball-loader";
import { formatScoreline } from "@/lib/match-format";
import { matchOutcome } from "@/lib/scoring";
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
  flag,
  value,
  leading,
  disabled,
  increaseLabel,
  decreaseLabel,
  onChange,
}: {
  label: string;
  flag?: string | null;
  value: number;
  leading: boolean;
  disabled: boolean;
  increaseLabel: string;
  decreaseLabel: string;
  onChange: (nextValue: number) => void;
}) {
  return (
    <div
      className={cn(
        "wc-fixture-card rounded-2xl border bg-card/95 p-4 shadow-sm transition-colors",
        leading && "border-gold/55 bg-gold/10 ring-2 ring-gold/45",
      )}
    >
      <div
        className="flex min-w-0 items-center justify-center gap-2 text-center text-sm font-black tracking-normal"
        dir="auto"
      >
        {flag ? (
          <span className="shrink-0 text-xl leading-none" aria-hidden>
            {flag}
          </span>
        ) : null}
        <span className="min-w-0 truncate">{label}</span>
        {leading ? (
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/20 ring-1 ring-gold/40">
            <Crown className="size-3.5 text-gold" aria-hidden />
          </span>
        ) : null}
      </div>
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
        <output
          className="min-w-16 text-center text-4xl font-black tabular-nums text-foreground"
          dir="ltr"
        >
          {value}
        </output>
        <Button
          type="button"
          size="icon-lg"
          variant="lime"
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
  homeFlag,
  awayFlag,
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
  homeFlag?: string | null;
  awayFlag?: string | null;
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
  // Monotonic id guarding against out-of-order saves; also lets a real save
  // invalidate a running "flourish" (and vice-versa).
  const saveIdRef = useRef(0);
  // Pending auto-save timer, so the Save button can flush it before forcing a
  // save (avoids a duplicate write).
  const debounceRef = useRef<number | undefined>(undefined);
  // Timer for the client-only confirmation replay on an already-saved pick.
  const flourishRef = useRef<number | undefined>(undefined);

  // The real persist, shared by the debounced auto-save and the Save button.
  // Scores are passed in (not read from closure) so a flushed save always uses
  // the latest values.
  const runSave = useCallback(
    async (home: number, away: number) => {
      const saveId = saveIdRef.current + 1;
      saveIdRef.current = saveId;
      setStatus("saving");
      setError(undefined);

      const formData = new FormData();
      formData.set("match_id", String(matchId));
      formData.set("home_score", String(home));
      formData.set("away_score", String(away));

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
    },
    [matchId],
  );

  useEffect(() => {
    const updateLock = () => setLocked(kickoffHasPassed(kickoffAt));
    updateLock();

    const interval = window.setInterval(updateLock, 30_000);
    return () => window.clearInterval(interval);
  }, [kickoffAt]);

  useEffect(() => {
    if (!hasInteracted || locked || tbd) return;

    const timer = window.setTimeout(() => {
      runSave(homeScore, awayScore);
    }, 600);
    debounceRef.current = timer;

    return () => window.clearTimeout(timer);
  }, [awayScore, hasInteracted, homeScore, locked, runSave, tbd]);

  // Cancel any pending confirmation replay on unmount.
  useEffect(() => () => window.clearTimeout(flourishRef.current), []);

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

  // Client-only confirmation replay for a pick that is already persisted — the
  // "pseudo" save effect: a quick spinner then "saved", no network write.
  const playFlourish = () => {
    const saveId = saveIdRef.current + 1;
    saveIdRef.current = saveId;
    setError(undefined);
    setStatus("saving");
    window.clearTimeout(flourishRef.current);
    flourishRef.current = window.setTimeout(() => {
      if (saveIdRef.current !== saveId) return;
      setStatus("saved");
      setSavedTick((tick) => tick + 1);
    }, 500);
  };

  const handleSaveClick = () => {
    if (disabled) return; // locked / tbd
    if (effectiveStatus === "saving") return; // loader already showing

    const alreadySaved =
      status === "saved" || (!hasInteracted && hasSavedPrediction);

    if (alreadySaved) {
      playFlourish();
      return;
    }

    // Unsaved change (or never-persisted 0-0): flush the pending auto-save and
    // persist the current scoreline immediately.
    window.clearTimeout(debounceRef.current);
    runSave(homeScore, awayScore);
  };

  const outcome = matchOutcome(homeScore, awayScore);
  const outcomeLabel =
    outcome === "home"
      ? t("teamToWin", { team: homeName })
      : outcome === "away"
        ? t("teamToWin", { team: awayName })
        : t("draw");
  const scoreline = formatScoreline(homeScore, awayScore, { isolate: true });

  const indicator = {
    idle: {
      icon: null,
      text: t("closesAtKickoff"),
      className: "bg-muted/50 text-muted-foreground",
    },
    saving: {
      icon: <BallLoader variant="inline" />,
      text: t("saving"),
      className: "bg-muted text-muted-foreground",
    },
    saved: {
      icon: <Check className="size-4" aria-hidden />,
      text: t("saved"),
      className: "bg-lime/25 text-lime-foreground ring-1 ring-lime/50",
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

  const saveButton = {
    idle: { icon: <Save className="size-5" aria-hidden />, text: t("save") },
    saving: { icon: <BallLoader variant="inline" />, text: t("saving") },
    saved: { icon: <Check className="size-5" aria-hidden />, text: t("saved") },
    locked: { icon: <Lock className="size-5" aria-hidden />, text: t("locked") },
    error: { icon: <Save className="size-5" aria-hidden />, text: t("save") },
  }[effectiveStatus];

  // The pick has been edited but isn't confirmed persisted yet — pull focus to
  // the Save button so the primary action is unmissable on mobile.
  const hasUnsavedChanges =
    !disabled && hasInteracted && effectiveStatus !== "saved";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 [direction:ltr]">
        <ScoreStepper
          label={homeName}
          flag={homeFlag}
          value={homeScore}
          leading={outcome === "home"}
          disabled={disabled}
          increaseLabel={t("increase", { team: homeName })}
          decreaseLabel={t("decrease", { team: homeName })}
          onChange={updateHome}
        />
        <ScoreStepper
          label={awayName}
          flag={awayFlag}
          value={awayScore}
          leading={outcome === "away"}
          disabled={disabled}
          increaseLabel={t("increase", { team: awayName })}
          decreaseLabel={t("decrease", { team: awayName })}
          onChange={updateAway}
        />
      </div>

      <p
        role="status"
        aria-live="polite"
        className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 py-3 pe-4 ps-4 text-start text-sm font-bold text-primary"
      >
        <span dir="auto">{outcomeLabel}</span>
        <span className="text-primary/60" aria-hidden>
          {"\u00B7"}
        </span>
        <span className="tabular-nums text-foreground" dir="ltr">
          {scoreline}
        </span>
      </p>

      <Button
        type="button"
        variant="lime"
        size="lg"
        className={cn(
          "h-12 w-full text-base font-bold shadow-lg",
          hasUnsavedChanges && "ring-2 ring-lime/50 ring-offset-2 ring-offset-background",
        )}
        disabled={disabled || effectiveStatus === "saving"}
        onClick={handleSaveClick}
      >
        {saveButton.icon}
        <span>{saveButton.text}</span>
      </Button>

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
