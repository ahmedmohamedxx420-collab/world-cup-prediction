"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type KickoffState = {
  label: string;
  locked: boolean;
};

function getKickoffState(iso: string, locale: string): KickoffState {
  const date = new Date(iso);
  const time = date.getTime();

  if (Number.isNaN(time)) {
    return { label: iso, locked: false };
  }

  return {
    label: new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date),
    locked: Date.now() >= time,
  };
}

export function LocalKickoff({
  iso,
  locale,
  closesLabel,
  lockedLabel,
  className,
}: {
  iso: string;
  locale: string;
  closesLabel: string;
  lockedLabel: string;
  className?: string;
}) {
  const [state, setState] = useState<KickoffState | null>(null);

  useEffect(() => {
    const update = () => setState(getKickoffState(iso, locale));
    update();

    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, [iso, locale]);

  return (
    <span
      className={cn("inline-flex flex-wrap items-center gap-1", className)}
      data-locked={state?.locked ? "true" : "false"}
    >
      <time dateTime={iso} className="tabular-nums">
        {state?.label ?? "..."}
      </time>
      <span aria-hidden>-</span>
      <span>{state?.locked ? lockedLabel : closesLabel}</span>
    </span>
  );
}
