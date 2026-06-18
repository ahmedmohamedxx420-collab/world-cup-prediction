"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { BallLoader } from "@/components/ball-loader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneNumberInput } from "./phone-number-input";
import { signInWithPhone, type PhoneLoginState } from "./phone-actions";

const initialState: PhoneLoginState = {};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button
      className="w-full"
      type="submit"
      variant="lime"
      disabled={pending || disabled}
    >
      {pending ? <BallLoader variant="inline" /> : null}
      {pending ? t("phoneSending") : t("phoneSubmit")}
    </Button>
  );
}

export function PhoneLoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [state, formAction] = useActionState(signInWithPhone, initialState);
  const [isPhoneReady, setIsPhoneReady] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="space-y-2">
        <Label id="phone-label" htmlFor="phone-national-1">
          {t("phoneLabel")}
        </Label>
        <PhoneNumberInput
          id="phone"
          aria-labelledby="phone-label"
          aria-describedby={state.error ? "phone-error" : undefined}
          aria-invalid={Boolean(state.error)}
          onCompletionChange={setIsPhoneReady}
        />
      </div>

      {state.error ? (
        <p id="phone-error" className="text-sm text-destructive" role="alert">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <SubmitButton disabled={!isPhoneReady} />
    </form>
  );
}
