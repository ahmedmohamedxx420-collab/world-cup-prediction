"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Team } from "@/lib/teams";
import { saveTeam, type TeamFormState } from "./actions";

const initialState: TeamFormState = {};

function SubmitButton({ label, saving }: { label: string; saving: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? saving : label}
    </Button>
  );
}

export function TeamForm({ team }: { team?: Team }) {
  const [state, formAction] = useActionState(saveTeam, initialState);
  const t = useTranslations("admin.teams");
  const c = useTranslations("admin.common");

  return (
    <form action={formAction} className="space-y-4">
      {team ? <input type="hidden" name="id" value={team.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name_en">{t("nameEn")}</Label>
          <Input
            id="name_en"
            name="name_en"
            defaultValue={team?.name_en ?? ""}
            maxLength={60}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name_ar">{t("nameAr")}</Label>
          <Input
            id="name_ar"
            name="name_ar"
            defaultValue={team?.name_ar ?? ""}
            maxLength={60}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">{t("code")}</Label>
          <Input
            id="code"
            name="code"
            defaultValue={team?.code ?? ""}
            maxLength={3}
            className="uppercase"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flag">{t("flag")}</Label>
          <Input
            id="flag"
            name="flag"
            defaultValue={team?.flag ?? ""}
            maxLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="group_letter">{t("group")}</Label>
          <Input
            id="group_letter"
            name="group_letter"
            defaultValue={team?.group_letter ?? ""}
            maxLength={1}
            className="uppercase"
          />
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <SubmitButton label={team ? c("save") : t("add")} saving={c("saving")} />
    </form>
  );
}
