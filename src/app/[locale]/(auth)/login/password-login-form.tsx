"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/auth/password-policy";
import {
  lookupLogin,
  setNewPassword,
  signInWithEmailPassword,
  type LookupLoginState,
  type PasswordAuthState,
  type PasswordLoginStep,
} from "./password-actions";

const lookupInitialState: LookupLoginState = {};
const authInitialState: PasswordAuthState = {};

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      type="submit"
      variant="lime"
      disabled={pending}
    >
      {pending ? <BallLoader variant="inline" /> : null}
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function PasswordLoginForm({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState(defaultEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(true);
  const [lookupState, lookupAction] = useActionState(
    lookupLogin,
    lookupInitialState,
  );
  const [passwordState, passwordAction] = useActionState(
    signInWithEmailPassword,
    authInitialState,
  );
  const [resetState, resetAction] = useActionState(
    setNewPassword,
    authInitialState,
  );
  const hasFreshLookup =
    lookupState.email === normalizeEmail(email) && Boolean(lookupState.step);
  const step: "email" | PasswordLoginStep =
    isEditingEmail || !hasFreshLookup ? "email" : lookupState.step!;
  const selectedEmail = hasFreshLookup ? lookupState.email! : email;

  function goBack() {
    setEmail(selectedEmail);
    setIsEditingEmail(true);
  }

  if (step === "email") {
    return (
      <form
        action={lookupAction}
        className="space-y-4"
        onSubmit={() => setIsEditingEmail(false)}
      >
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-2">
          <Label htmlFor="password-login-email">{t("emailLabel")}</Label>
          <Input
            id="password-login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
            aria-invalid={Boolean(lookupState.error)}
            required
          />
        </div>

        {lookupState.error ? (
          <p className="text-sm text-destructive" role="alert">
            {t(`errors.${lookupState.error}`)}
          </p>
        ) : null}

        <SubmitButton label={t("continue")} pendingLabel={t("checking")} />

        <p className="text-center text-sm text-muted-foreground">
          {t("needAccount")}{" "}
          <Link href="/signup" className="font-medium text-primary underline">
            {t("signupLink")}
          </Link>
        </p>
      </form>
    );
  }

  if (step === "set_password") {
    return (
      <form action={resetAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="email" value={selectedEmail} />

        <div className="space-y-1">
          <h2 className="font-semibold">{t("setPasswordTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("setPasswordDescription", { email: selectedEmail })}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">{t("newPasswordLabel")}</Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            aria-invalid={Boolean(resetState.error)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-new-password">
            {t("confirmPasswordLabel")}
          </Label>
          <Input
            id="confirm-new-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            aria-invalid={Boolean(resetState.error)}
            required
          />
        </div>

        {resetState.error ? (
          <p className="text-sm text-destructive" role="alert">
            {t(`errors.${resetState.error}`, { count: MIN_PASSWORD_LENGTH })}
          </p>
        ) : null}

        <SubmitButton label={t("savePassword")} pendingLabel={t("savingPassword")} />
        <Button type="button" variant="link" className="w-full" onClick={goBack}>
          {t("back")}
        </Button>
      </form>
    );
  }

  return (
    <form action={passwordAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="email" value={selectedEmail} />

      <div className="space-y-1">
        <h2 className="font-semibold">{t("enterPasswordTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("enterPasswordDescription", { email: selectedEmail })}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{t("passwordLabel")}</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={MIN_PASSWORD_LENGTH}
          aria-invalid={Boolean(passwordState.error)}
          required
        />
      </div>

      {passwordState.error ? (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${passwordState.error}`, { count: MIN_PASSWORD_LENGTH })}
        </p>
      ) : null}

      <SubmitButton label={t("loginSubmit")} pendingLabel={t("loggingIn")} />
      <Button type="button" variant="link" className="w-full" onClick={goBack}>
        {t("back")}
      </Button>
    </form>
  );
}
