// Auth-mode switch.
//
// Password auth is the day-to-day default. The lightweight phone sign-in and
// original Supabase email-OTP flow are still kept behind the flag for reuse:
// set `NEXT_PUBLIC_AUTH_MODE` to `"phone"` or `"otp"` explicitly.
//
// `NEXT_PUBLIC_*` so both the server (login page, middleware) and the browser
// (form components) read the same value.

export type AuthMode = "phone" | "otp" | "password";

const configuredMode = process.env.NEXT_PUBLIC_AUTH_MODE;

export const AUTH_MODE: AuthMode =
  configuredMode === "phone" || configuredMode === "otp"
    ? configuredMode
    : "password";
