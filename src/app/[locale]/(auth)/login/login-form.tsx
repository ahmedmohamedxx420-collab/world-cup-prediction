"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthErrorKey = "generic" | "invalidCode" | "rateLimited";

const RESEND_COOLDOWN_SECONDS = 30;

export function LoginForm() {
  const t = useTranslations("auth");
  const toastT = useTranslations("toasts");
  const locale = useLocale();
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timeout = window.setTimeout(
      () => setCooldown((seconds) => seconds - 1),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  async function requestCode() {
    setError(null);
    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.status === 429 ? "rateLimited" : "generic");
      return;
    }

    toast.success(toastT("codeSent", { email }));
    setStep("code");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestCode();
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data: verifyData, error: authError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (authError) {
      setIsLoading(false);
      if (authError.status === 429) {
        setError("rateLimited");
      } else if (authError.status === 400 || authError.status === 403) {
        setError("invalidCode");
      } else {
        setError("generic");
      }
      return;
    }

    // Profiles are readable by every authenticated user (leaderboard RLS), so
    // we must filter to the signed-in user — otherwise maybeSingle() errors on
    // multiple rows once more than one family member has registered.
    const userId = verifyData.user?.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId ?? "")
      .maybeSingle();

    if (profileError) {
      setIsLoading(false);
      setError("generic");
      return;
    }

    // Full-document navigation (not a soft router push) so the server re-reads
    // the auth cookies that verifyOtp just set; a client-side push can race the
    // cookie write and land the user back on login. We keep isLoading true so
    // the button stays disabled through the reload.
    const destination = profile ? "/fixtures" : "/onboarding";
    window.location.assign(`/${locale}${destination}`);
  }

  function changeEmail() {
    setStep("email");
    setCode("");
    setError(null);
  }

  if (step === "email") {
    return (
      <form className="space-y-4" onSubmit={handleEmailSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
            aria-invalid={Boolean(error)}
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {t(`errors.${error}`)}
          </p>
        ) : null}

        <Button
          className="w-full"
          type="submit"
          variant="lime"
          disabled={isLoading}
        >
          {isLoading ? <BallLoader variant="inline" /> : null}
          {isLoading ? t("sending") : t("sendCode")}
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleCodeSubmit}>
      <p className="text-sm text-muted-foreground">
        {t("codeDescription", { email })}
      </p>

      <div className="space-y-2">
        <Label htmlFor="code">{t("codeLabel")}</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          className="text-center text-lg tracking-[0.35em]"
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          aria-invalid={Boolean(error)}
          minLength={6}
          maxLength={6}
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <Button
        className="w-full"
        type="submit"
        variant="lime"
        disabled={isLoading || code.length !== 6}
      >
        {isLoading ? <BallLoader variant="inline" /> : null}
        {isLoading ? t("verifying") : t("verify")}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="link" size="sm" onClick={changeEmail}>
          {t("changeEmail")}
        </Button>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={requestCode}
          disabled={isLoading || cooldown > 0}
        >
          {cooldown > 0
            ? t("resendIn", { seconds: cooldown })
            : t("resend")}
        </Button>
      </div>
    </form>
  );
}
