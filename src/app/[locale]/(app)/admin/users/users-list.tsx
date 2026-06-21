"use client";

import {
  type FormEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BallLoader } from "@/components/ball-loader";
import {
  resetUserPassword,
  type ResetPasswordState,
} from "./actions";

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  password_reset_pending: boolean;
  has_profile: boolean;
  created_at: string;
};

const initialState: ResetPasswordState = {};

function ResetSubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("admin.users");

  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? <BallLoader variant="inline" /> : null}
      {pending ? t("resetting") : t("resetButton")}
    </Button>
  );
}

function ResetPasswordForm({ row }: { row: AdminUserRow }) {
  const t = useTranslations("admin.users");
  const [state, formAction] = useActionState(resetUserPassword, initialState);
  const shownToast = useRef<string | null>(null);
  const displayName = row.full_name ?? row.email;

  useEffect(() => {
    if (!state.toastId || shownToast.current === state.toastId) return;
    shownToast.current = state.toastId;

    if (state.ok) {
      toast.success(t("resetToast", { email: row.email }));
    } else if (state.error) {
      toast.error(t(`errors.${state.error}`));
    }
  }, [row.email, state, t]);

  function confirmReset(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(t("confirm", { name: displayName }))) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={confirmReset}>
      <input type="hidden" name="userId" value={row.id} />
      <ResetSubmitButton />
    </form>
  );
}

export function UsersList({ rows }: { rows: AdminUserRow[] }) {
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;

    return rows.filter((row) =>
      [row.email, row.full_name ?? ""].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [query, rows]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-user-search">{t("searchLabel")}</Label>
        <Input
          id="admin-user-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {t("count", { count: filteredRows.length })}
      </p>

      {filteredRows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card/80">
          {filteredRows.map((row) => {
            const name = row.full_name ?? t("noProfile");
            const joined = new Date(row.created_at).toLocaleDateString(locale);

            return (
              <li
                key={row.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={row.avatar_url}
                    name={row.full_name ?? row.email}
                    className="size-11"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{name}</p>
                      {row.is_admin ? (
                        <Badge variant="secondary">{t("adminBadge")}</Badge>
                      ) : null}
                      {row.password_reset_pending ? (
                        <Badge variant="outline">{t("pendingBadge")}</Badge>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground" dir="ltr">
                      {row.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(row.has_profile ? "joined" : "profilePending", {
                        date: joined,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 justify-end">
                  <ResetPasswordForm row={row} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
