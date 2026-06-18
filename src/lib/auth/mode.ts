// Auth-mode switch.
//
// This app ships with a lightweight "phone number" sign-in (no SMS, no real
// verification — see `login/phone-actions.ts`) intended for a small, trusted
// friend group. The original Supabase email-OTP flow is kept intact in
// `login/login-form.tsx` so it can be reused as-is in another project: flip
// `NEXT_PUBLIC_AUTH_MODE` to `"otp"` and the email flow comes back with no
// other changes.
//
// `NEXT_PUBLIC_*` so both the server (login page, middleware) and the browser
// (form components) read the same value.

export type AuthMode = "phone" | "otp";

export const AUTH_MODE: AuthMode =
  process.env.NEXT_PUBLIC_AUTH_MODE === "otp" ? "otp" : "phone";
