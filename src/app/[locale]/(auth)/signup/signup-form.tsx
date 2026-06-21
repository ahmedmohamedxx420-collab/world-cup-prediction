"use client";

import { type FormEvent, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";
import {
  signUpWithEmailPassword,
  type SignUpState,
} from "./actions";

const initialState: SignUpState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button
      className="w-full"
      type="submit"
      variant="lime"
      disabled={pending}
    >
      {pending ? <BallLoader variant="inline" /> : null}
      {pending ? t("creatingAccount") : t("createAccount")}
    </Button>
  );
}

export function SignUpForm({
  locale,
  defaultEmail = "",
}: {
  locale: string;
  defaultEmail?: string;
}) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(
    signUpWithEmailPassword,
    initialState,
  );
  const [clientError, setClientError] = useState<SignUpState["error"]>(undefined);
  const error = clientError ?? state.error;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    setClientError(undefined);

    if (password.length < MIN_PASSWORD_LENGTH) {
      event.preventDefault();
      setClientError("passwordTooShort");
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setClientError("passwordsDontMatch");
    }
  }

  return (
    <form action={formAction} className="space-y-4" onSubmit={handleSubmit}>
      <input type="hidden" name="locale" value={locale} />

      <div className="space-y-2">
        <Label htmlFor="signup-email">{t("emailLabel")}</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          defaultValue={defaultEmail}
          placeholder={t("emailPlaceholder")}
          aria-invalid={error === "invalidEmail" || error === "emailTaken"}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">{t("passwordLabel")}</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          aria-invalid={
            error === "passwordTooShort" || error === "passwordsDontMatch"
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm-password">
          {t("confirmPasswordLabel")}
        </Label>
        <Input
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          aria-invalid={
            error === "passwordTooShort" || error === "passwordsDontMatch"
          }
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${error}`, { count: MIN_PASSWORD_LENGTH })}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary underline">
          {t("signInLink")}
        </Link>
      </p>
    </form>
  );
}
