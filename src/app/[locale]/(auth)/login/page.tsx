import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AUTH_MODE } from "@/lib/auth/mode";
import { LoginForm } from "./login-form";
import { PhoneLoginForm } from "./phone-login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  const isPhone = AUTH_MODE === "phone";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t(isPhone ? "phoneDescription" : "description")}
        </CardDescription>
      </CardHeader>
      <CardContent>{isPhone ? <PhoneLoginForm /> : <LoginForm />}</CardContent>
    </Card>
  );
}
