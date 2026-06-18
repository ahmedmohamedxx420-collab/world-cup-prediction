"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { AvatarUpload } from "@/components/avatar-upload";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, type ProfileState } from "./actions";

const initialState: ProfileState = {};

function SubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations("profile");

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

export function ProfileForm({
  fullName,
  avatarUrl,
  locale,
}: {
  fullName: string;
  avatarUrl: string | null;
  locale: string;
}) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const t = useTranslations("profile");
  const language = useTranslations("language");
  const [currentFullName, setCurrentFullName] = useState(fullName);
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
          value={currentFullName}
          onChange={(event) => setCurrentFullName(event.target.value)}
          aria-invalid={Boolean(state.error)}
          maxLength={100}
          required
        />
      </div>

      <AvatarUpload
        fullName={currentFullName}
        initialUrl={avatarUrl}
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
