import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Home() {
  const t = useTranslations("common");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("appName")}</CardTitle>
          <CardDescription>{t("tagline")}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {/* Sample text proves logical-property mirroring in RTL/LTR. */}
          <p className="border-s-4 border-primary ps-3 text-start">
            {t("tagline")}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">{t("start")}</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
