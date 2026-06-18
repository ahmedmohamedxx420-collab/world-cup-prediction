"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { AvatarUpload } from "@/components/avatar-upload";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  completeOnboarding,
  type OnboardingState,
} from "./actions";

const initialState: OnboardingState = {};

function SubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations("onboarding");

  return (
    <Button
      className="w-full"
      type="submit"
      variant="lime"
      disabled={pending || disabled}
    >
      {pending ? <BallLoader variant="inline" /> : null}
      {pending ? t("saving") : disabled ? t("photoUploading") : t("save")}
    </Button>
  );
}

export function OnboardingForm({ locale }: { locale: string }) {
  const [state, formAction] = useActionState(
    completeOnboarding,
    initialState,
  );
  const t = useTranslations("onboarding");
  const language = useTranslations("language");
  const [fullName, setFullName] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t("nameLabel")}</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          aria-invalid={Boolean(state.error)}
          maxLength={100}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
      </div>

      <AvatarUpload
        fullName={fullName}
        onUploadingChange={setAvatarUploading}
      />

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

      <SubmitButton disabled={avatarUploading} />
    </form>
  );
}
