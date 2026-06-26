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
  searchParams: Promise<{ username?: string }>;
}) {
  const { locale } = await params;
  const { username } = await searchParams;
  const defaultUsername = typeof username === "string" ? username : "";
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  const descriptionKey =
    AUTH_MODE === "phone"
      ? "phoneDescription"
      : AUTH_MODE === "otp"
        ? "description"
        : "passwordDescription";

  return (
    <AuthCard
      eyebrow={tCommon("competition")}
      title={t("title")}
      description={t(descriptionKey)}
    >
      {AUTH_MODE === "phone" ? (
        <PhoneLoginForm />
      ) : AUTH_MODE === "otp" ? (
        <LoginForm />
      ) : (
        <PasswordLoginForm defaultUsername={defaultUsername} />
      )}
    </AuthCard>
  );
}
