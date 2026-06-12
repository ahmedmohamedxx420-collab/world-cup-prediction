import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

function getRequestLocale(pathname: string) {
  return (
    routing.locales.find(
      (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    ) ?? routing.defaultLocale
  );
}

function redirectWithCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);

  response.cookies
    .getAll()
    .forEach((cookie) => redirectResponse.cookies.set(cookie));

  return redirectResponse;
}

export async function updateSession(
  request: NextRequest,
  response: NextResponse,
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const locale = getRequestLocale(pathname);
  const localizedPath = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  const isAppRoute = ["/fixtures", "/leaderboard", "/profile"].some(
    (route) =>
      localizedPath === route || localizedPath.startsWith(`${route}/`),
  );

  if (!user && isAppRoute) {
    return redirectWithCookies(
      new URL(`/${locale}/login`, request.url),
      response,
    );
  }

  if (user && localizedPath === "/login") {
    return redirectWithCookies(
      new URL(`/${locale}/fixtures`, request.url),
      response,
    );
  }

  return response;
}
