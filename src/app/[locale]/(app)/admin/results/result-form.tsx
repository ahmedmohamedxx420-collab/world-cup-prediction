"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordResult, clearResult, type ResultFormState } from "./actions";

const initialState: ResultFormState = {};

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

type TeamOption = { id: number; name: string };

function SaveButton({ label, saving }: { label: string; saving: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? saving : label}
    </Button>
  );
}

function ClearButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="destructive" disabled={pending}>
      {label}
    </Button>
  );
}

export function ResultForm({
  matchId,
  homeScore,
  awayScore,
  shootoutWinnerId,
  teamOptions,
}: {
  matchId: number;
  homeScore: number | null;
  awayScore: number | null;
  shootoutWinnerId: number | null;
  teamOptions: TeamOption[];
}) {
  const [state, formAction] = useActionState(recordResult, initialState);
  const t = useTranslations("admin.results");
  const hasResult = homeScore != null && awayScore != null;

  return (
    <div className="space-y-3">
      <form
        action={formAction}
        className="flex flex-wrap items-end gap-3 [direction:ltr]"
      >
        <input type="hidden" name="match_id" value={matchId} />
        <div className="space-y-1">
          <Label htmlFor={`home-${matchId}`} className="text-xs" dir="auto">
            {t("homeScore")}
          </Label>
          <Input
            id={`home-${matchId}`}
            name="home_score"
            type="number"
            min={0}
            max={99}
            defaultValue={homeScore ?? ""}
            className="w-20"
            dir="ltr"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`away-${matchId}`} className="text-xs" dir="auto">
            {t("awayScore")}
          </Label>
          <Input
            id={`away-${matchId}`}
            name="away_score"
            type="number"
            min={0}
            max={99}
            defaultValue={awayScore ?? ""}
            className="w-20"
            dir="ltr"
            required
          />
        </div>

        {teamOptions.length === 2 ? (
          <div className="w-48 space-y-1">
            <Label htmlFor={`so-${matchId}`} className="text-xs" dir="auto">
              {t("shootoutWinner")}
            </Label>
            <select
              id={`so-${matchId}`}
              name="shootout_winner_team_id"
              defaultValue={shootoutWinnerId != null ? String(shootoutWinnerId) : ""}
              className={selectClass}
            >
              <option value="">{t("noShootout")}</option>
              {teamOptions.map((option) => (
                <option key={option.id} value={String(option.id)}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <SaveButton label={t("save")} saving={t("saving")} />
      </form>

      {hasResult ? (
        <form action={clearResult}>
          <input type="hidden" name="match_id" value={matchId} />
          <ClearButton label={t("clear")} />
        </form>
      ) : null}

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}
    </div>
  );
}
