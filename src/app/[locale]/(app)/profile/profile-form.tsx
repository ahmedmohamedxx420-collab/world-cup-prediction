"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, type ProfileState } from "./actions";

const initialState: ProfileState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("profile");

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? t("saving") : t("save")}
    </Button>
  );
}

export function ProfileForm({
  fullName,
  locale,
}: {
  fullName: string;
  locale: string;
}) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const t = useTranslations("profile");
  const language = useTranslations("language");

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t("nameLabel")}</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={fullName}
          aria-invalid={Boolean(state.error)}
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locale">{t("localeLabel")}</Label>
        <select
          id="locale"
          name="locale"
          defaultValue={locale}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        >
          <option value="ar">{language("ar")}</option>
          <option value="en">{language("en")}</option>
        </select>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
