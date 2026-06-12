import { getTranslations } from "next-intl/server";
import { User } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default async function ProfilePage() {
  const t = await getTranslations();
  return (
    <EmptyState
      icon={<User className="size-8" aria-hidden />}
      title={t("nav.profile")}
      description={t("comingSoon.description")}
    />
  );
}
