"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MATCH_STAGES, type Match } from "@/lib/match-types";
import type { Team } from "@/lib/teams";
import { saveFixture, type FixtureFormState } from "./actions";

const initialState: FixtureFormState = {};

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

// The stored kickoff is UTC ISO; datetime-local needs "YYYY-MM-DDTHH:mm" in UTC
// wall-clock, which is exactly the first 16 chars of toISOString().
function toUtcInputValue(iso: string | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function selectValue(id: number | null | undefined) {
  return id != null ? String(id) : "";
}

function SubmitButton({ label, saving }: { label: string; saving: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? saving : label}
    </Button>
  );
}

export function FixtureForm({
  teams,
  fixture,
}: {
  teams: Team[];
  fixture?: Match;
}) {
  const [state, formAction] = useActionState(saveFixture, initialState);
  const t = useTranslations("admin.fixtures");
  const c = useTranslations("admin.common");
  const stagesT = useTranslations("admin.fixtures.stages");

  return (
    <form action={formAction} className="space-y-4">
      {fixture ? <input type="hidden" name="id" value={fixture.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stage">{t("stage")}</Label>
          <select
            id="stage"
            name="stage"
            defaultValue={fixture?.stage ?? "group"}
            className={selectClass}
          >
            {MATCH_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stagesT(stage)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="group_letter">{t("group")}</Label>
          <Input
            id="group_letter"
            name="group_letter"
            defaultValue={fixture?.group_letter ?? ""}
            maxLength={1}
            className="uppercase"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="home_team_id">{t("home")}</Label>
          <select
            id="home_team_id"
            name="home_team_id"
            defaultValue={selectValue(fixture?.home_team_id)}
            className={selectClass}
          >
            <option value="">{t("tbd")}</option>
            {teams.map((team) => (
              <option key={team.id} value={String(team.id)}>
                {team.name_en}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="away_team_id">{t("away")}</Label>
          <select
            id="away_team_id"
            name="away_team_id"
            defaultValue={selectValue(fixture?.away_team_id)}
            className={selectClass}
          >
            <option value="">{t("tbd")}</option>
            {teams.map((team) => (
              <option key={team.id} value={String(team.id)}>
                {team.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="home_label">{t("homeLabel")}</Label>
          <Input
            id="home_label"
            name="home_label"
            defaultValue={fixture?.home_label ?? ""}
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="away_label">{t("awayLabel")}</Label>
          <Input
            id="away_label"
            name="away_label"
            defaultValue={fixture?.away_label ?? ""}
            maxLength={60}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kickoff_at">{t("kickoff")}</Label>
          <Input
            id="kickoff_at"
            name="kickoff_at"
            type="datetime-local"
            defaultValue={toUtcInputValue(fixture?.kickoff_at)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue">{t("venue")}</Label>
          <Input
            id="venue"
            name="venue"
            defaultValue={fixture?.venue ?? ""}
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="match_number">{t("matchNumber")}</Label>
          <Input
            id="match_number"
            name="match_number"
            type="number"
            min={1}
            max={104}
            defaultValue={fixture?.match_number ?? ""}
          />
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <SubmitButton label={fixture ? c("save") : t("add")} saving={c("saving")} />
    </form>
  );
}
