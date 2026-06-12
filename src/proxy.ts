import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

// Next 16 names this file `proxy.ts` (formerly `middleware.ts`). It handles
// locale detection/prefixing and refreshes the Supabase auth session.
const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  return updateSession(request, response);
}

export const config = {
  // Skip API routes, Next internals, and any file with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
