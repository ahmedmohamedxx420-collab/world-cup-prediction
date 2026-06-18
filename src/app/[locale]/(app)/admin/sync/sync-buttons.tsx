"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import {
  runFullSync,
  runResultsSync,
  type SyncActionState,
} from "./actions";

const initialState: SyncActionState = {};

function SubmitButton({
  label,
  variant,
}: {
  label: string;
  variant?: "default" | "outline";
}) {
  const { pending } = useFormStatus();
  const t = useTranslations("admin.sync");
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? <BallLoader variant="inline" /> : null}
      {pending ? t("running") : label}
    </Button>
  );
}

export function SyncButtons() {
  const t = useTranslations("admin.sync");
  const toastT = useTranslations("toasts");
  const [resultsState, resultsAction] = useActionState(
    runResultsSync,
    initialState,
  );
  const [fullState, fullAction] = useActionState(runFullSync, initialState);
  const shownResultsToast = useRef<string | null>(null);
  const shownFullToast = useRef<string | null>(null);

  useEffect(() => {
    if (!resultsState.toastId) return;
    if (shownResultsToast.current === resultsState.toastId) return;
    shownResultsToast.current = resultsState.toastId;

    if (resultsState.ok) {
      toast.success(
        toastT("syncResultsDone", { count: resultsState.count ?? 0 }),
      );
    } else if (resultsState.error) {
      toast.error(toastT("errorGeneric"));
    }
  }, [resultsState, toastT]);

  useEffect(() => {
    if (!fullState.toastId) return;
    if (shownFullToast.current === fullState.toastId) return;
    shownFullToast.current = fullState.toastId;

    if (fullState.ok) {
      toast.success(
        toastT("syncScheduleDone", { count: fullState.count ?? 0 }),
      );
    } else if (fullState.error) {
      toast.error(toastT("errorGeneric"));
    }
  }, [fullState, toastT]);

  return (
    <div className="flex flex-wrap gap-3">
      <form action={resultsAction}>
        <SubmitButton label={t("resultsSync")} />
      </form>
      <form action={fullAction}>
        <SubmitButton label={t("fullSync")} variant="outline" />
      </form>
    </div>
  );
}
