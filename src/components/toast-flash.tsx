"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { usePathname, useRouter } from "@/i18n/navigation";

const TOAST_KEYS = new Set([
  "profileSaved",
  "teamSaved",
  "fixtureSaved",
  "resultSaved",
  "resultCleared",
  "codeSent",
  "syncScheduleDone",
  "syncResultsDone",
  "errorGeneric",
  "errorRateLimited",
]);

const ERROR_KEYS = new Set(["errorGeneric", "errorRateLimited"]);

function ToastFlashReader() {
  const t = useTranslations("toasts");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shownRef = useRef<string | null>(null);
  const toastKey = searchParams.get("toast");
  const count = searchParams.get("count");
  const email = searchParams.get("email");

  const cleanHref = useMemo(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("toast");
    nextParams.delete("count");
    nextParams.delete("email");
    const query = nextParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!toastKey || !TOAST_KEYS.has(toastKey)) return;

    const fingerprint = `${toastKey}:${count ?? ""}:${email ?? ""}`;
    if (shownRef.current === fingerprint) return;
    shownRef.current = fingerprint;

    const values = {
      count: count == null ? 0 : Number(count),
      email: email ?? "",
    };
    const message = t(toastKey, values);

    if (ERROR_KEYS.has(toastKey)) {
      toast.error(message);
    } else {
      toast.success(message);
    }

    router.replace(cleanHref, { scroll: false });
  }, [cleanHref, count, email, router, t, toastKey]);

  return null;
}

export function ToastFlash() {
  return (
    <Suspense fallback={null}>
      <ToastFlashReader />
    </Suspense>
  );
}
