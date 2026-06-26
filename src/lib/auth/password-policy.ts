export const MIN_PASSWORD_LENGTH = 4;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Username login --------------------------------------------------------
//
// Users sign in with a username, not an email. Supabase Auth still needs an
// email under the hood, so each username maps to a deterministic *synthetic*
// email `<username>@users.local` (same trick as phone auth's `@phone.local`).
// Because the email is a pure function of the username, Supabase's built-in
// uniqueness on `auth.users.email` enforces username uniqueness for free.

export const MIN_USERNAME_LENGTH = 4;
export const MAX_USERNAME_LENGTH = 20;
export const SYNTHETIC_USERNAME_DOMAIN = "users.local";

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

// Lowercase letters and digits only — no spaces, symbols, or capitals.
export function isValidUsername(username: string) {
  return new RegExp(
    `^[a-z0-9]{${MIN_USERNAME_LENGTH},${MAX_USERNAME_LENGTH}}$`,
  ).test(username);
}

export function usernameToEmail(username: string) {
  return `${username}@${SYNTHETIC_USERNAME_DOMAIN}`;
}

// Reverse of `usernameToEmail`: returns the username when `email` is one of our
// synthetic addresses, otherwise null (e.g. real emails or phone accounts).
export function usernameFromSyntheticEmail(
  email: string | null | undefined,
): string | null {
  if (!email) return null;
  const suffix = `@${SYNTHETIC_USERNAME_DOMAIN}`;
  if (!email.endsWith(suffix)) return null;
  return email.slice(0, -suffix.length) || null;
}
