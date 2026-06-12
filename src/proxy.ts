import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 names this file `proxy.ts` (formerly `middleware.ts`). It handles
// locale detection and prefixing (e.g. `/` → `/ar`).
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, and any file with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
