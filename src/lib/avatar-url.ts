import "server-only";

export function avatarObjectPath(userId: string) {
  return `${userId}/avatar.webp`;
}

export function normalizeOwnAvatarUrl(
  value: FormDataEntryValue | null,
  userId: string,
):
  | { ok: true; avatarUrl: string | null }
  | { ok: false } {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return { ok: true, avatarUrl: null };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return { ok: false };

  try {
    const url = new URL(raw);
    const expectedOrigin = new URL(supabaseUrl).origin;

    if (url.origin !== expectedOrigin) return { ok: false };
    if (
      url.pathname !==
      `/storage/v1/object/public/avatars/${avatarObjectPath(userId)}`
    ) {
      return { ok: false };
    }
    if (url.hash) return { ok: false };

    for (const key of url.searchParams.keys()) {
      if (key !== "v") return { ok: false };
    }

    const version = url.searchParams.get("v");
    if (version != null && !/^\d+$/.test(version)) return { ok: false };

    return { ok: true, avatarUrl: url.toString() };
  } catch {
    return { ok: false };
  }
}
