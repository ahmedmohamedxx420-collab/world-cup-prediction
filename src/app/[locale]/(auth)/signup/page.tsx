import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "../auth-card";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage({
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

  return (
    <AuthCard title={t("signupTitle")} description={t("signupDescription")}>
      <SignUpForm locale={locale} defaultEmail={defaultEmail} />
    </AuthCard>
  );
}
