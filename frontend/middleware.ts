import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPER_ADMIN_DOMAIN = "@tracebuild.info";

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isAuthRoute    = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isLandingRoute = pathname === "/";
    const isSuperAdmin   = !!user?.email?.endsWith(SUPER_ADMIN_DOMAIN);

    // Not logged in → redirect to login (except auth/landing routes)
    if (!user && !isAuthRoute && !isLandingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Logged in on auth/landing → route by email domain
    if (user && (isAuthRoute || isLandingRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = isSuperAdmin ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }

    // Protect /admin (super admin portal) — non-tracebuild.info users go to /dashboard
    // /admin/org is the org admin portal and handles its own auth guard
    if (
      user &&
      pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/org") &&
      !isSuperAdmin
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
