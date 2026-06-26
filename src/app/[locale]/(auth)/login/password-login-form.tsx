"use client";

import { type FormEvent, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  normalizeUsername,
} from "@/lib/auth/password-policy";
import {
  lookupLogin,
  setNewPassword,
  signInWithUsernamePassword,
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
  defaultUsername = "",
}: {
  defaultUsername?: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [username, setUsername] = useState(defaultUsername);
  const [isEditingUsername, setIsEditingUsername] = useState(true);
  const [lookupState, lookupAction] = useActionState(
    lookupLogin,
    lookupInitialState,
  );
  const [passwordState, passwordAction] = useActionState(
    signInWithUsernamePassword,
    authInitialState,
  );
  const [resetState, resetAction] = useActionState(
    setNewPassword,
    authInitialState,
  );
  const [resetClientError, setResetClientError] =
    useState<PasswordAuthState["error"]>(undefined);
  const resetError = resetClientError ?? resetState.error;
  const hasFreshLookup =
    lookupState.username === normalizeUsername(username) &&
    Boolean(lookupState.step);
  const step: "username" | PasswordLoginStep =
    isEditingUsername || !hasFreshLookup ? "username" : lookupState.step!;
  const selectedUsername = hasFreshLookup ? lookupState.username! : username;

  function goBack() {
    setUsername(selectedUsername);
    setIsEditingUsername(true);
  }

  function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    setResetClientError(undefined);

    if (password.length < MIN_PASSWORD_LENGTH) {
      event.preventDefault();
      setResetClientError("passwordTooShort");
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setResetClientError("passwordsDontMatch");
    }
  }

  if (step === "username") {
    return (
      <form
        action={lookupAction}
        className="space-y-4"
        onSubmit={() => setIsEditingUsername(false)}
      >
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-2">
          <Label htmlFor="password-login-username">{t("usernameLabel")}</Label>
          <Input
            id="password-login-username"
            name="username"
            type="text"
            inputMode="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            dir="ltr"
            minLength={MIN_USERNAME_LENGTH}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={t("usernamePlaceholder")}
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
      <form
        action={resetAction}
        className="space-y-4"
        onSubmit={handleResetSubmit}
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="username" value={selectedUsername} />

        <div className="space-y-1">
          <h2 className="font-semibold">{t("setPasswordTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("setPasswordDescription", { username: selectedUsername })}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">{t("newPasswordLabel")}</Label>
          <Input
            id="new-password"
            name="password"
            type="text"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            dir="ltr"
            minLength={MIN_PASSWORD_LENGTH}
            aria-invalid={Boolean(resetError)}
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
            type="text"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            dir="ltr"
            minLength={MIN_PASSWORD_LENGTH}
            aria-invalid={Boolean(resetError)}
            required
          />
        </div>

        {resetError ? (
          <p className="text-sm text-destructive" role="alert">
            {t(`errors.${resetError}`, { count: MIN_PASSWORD_LENGTH })}
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
      <input type="hidden" name="username" value={selectedUsername} />

      <div className="space-y-1">
        <h2 className="font-semibold">{t("enterPasswordTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("enterPasswordDescription", { username: selectedUsername })}
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

      {passwordState.error === "wrongPassword" ? (
        <div
          className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
          role="alert"
        >
          <p className="font-medium text-destructive">
            {t(`errors.${passwordState.error}`, {
              count: MIN_PASSWORD_LENGTH,
            })}
          </p>
          <div className="space-y-1">
            <p className="font-semibold">{t("passwordResetTipTitle")}</p>
            <p className="text-muted-foreground">
              {t("passwordResetTipBody")}
            </p>
          </div>
        </div>
      ) : passwordState.error ? (
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
