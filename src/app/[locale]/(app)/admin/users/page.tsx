import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsersList, type AdminUserRow } from "./users-list";

type ProfileRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  password_reset_pending: boolean;
};

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin.users");
  const admin = createAdminClient();
  const { data: usersData, error: usersError } =
    await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (usersError) throw usersError;

  const users = usersData.users;
  const ids = users.map((user) => user.id);
  const profilesById = new Map<string, ProfileRow>();

  if (ids.length > 0) {
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url, is_admin, password_reset_pending")
      .in("id", ids);

    if (profilesError) throw profilesError;

    for (const profile of (profiles ?? []) as ProfileRow[]) {
      profilesById.set(profile.id, profile);
    }
  }

  const rows: AdminUserRow[] = users
    .map((user) => {
      const profile = profilesById.get(user.id);

      return {
        id: user.id,
        email: user.email ?? "",
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        is_admin: profile?.is_admin ?? false,
        password_reset_pending: profile?.password_reset_pending ?? false,
        has_profile: Boolean(profile),
        created_at: user.created_at,
      };
    })
    .sort((a, b) =>
      (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email),
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <UsersList rows={rows} />
      </CardContent>
    </Card>
  );
}
