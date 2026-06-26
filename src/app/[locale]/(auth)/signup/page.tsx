import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "../auth-card";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ username?: string; reason?: string }>;
}) {
  const { locale } = await params;
  const { username, reason } = await searchParams;
  const defaultUsername = typeof username === "string" ? username : "";
  const notFound = reason === "notfound";
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthCard
      eyebrow={tCommon("competition")}
      title={t("signupTitle")}
      description={t("signupDescription")}
    >
      <SignUpForm
        locale={locale}
        defaultUsername={defaultUsername}
        notFound={notFound}
      />
    </AuthCard>
  );
}
