import { getTranslations, setRequestLocale } from "next-intl/server";
import { AUTH_MODE } from "@/lib/auth/mode";
import { AuthCard } from "../auth-card";
import { LoginForm } from "./login-form";
import { PasswordLoginForm } from "./password-login-form";
import { PhoneLoginForm } from "./phone-login-form";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  const { email } = await searchParams;
  const defaultEmail = typeof email === "string" ? email : "";
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  const descriptionKey =
    AUTH_MODE === "phone"
      ? "phoneDescription"
      : AUTH_MODE === "otp"
        ? "description"
        : "passwordDescription";

  return (
    <AuthCard title={t("title")} description={t(descriptionKey)}>
      {AUTH_MODE === "phone" ? (
        <PhoneLoginForm />
      ) : AUTH_MODE === "otp" ? (
        <LoginForm />
      ) : (
        <PasswordLoginForm defaultEmail={defaultEmail} />
      )}
    </AuthCard>
  );
}
