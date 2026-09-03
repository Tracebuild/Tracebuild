import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAILS = new Set([
  "tracebuild.info@gmail.com",
  "livio.thoma07@gmail.com",
  "jonasjud87@gmail.com",
  "liviocyrill.thomamanser@gmail.com",
]);

// Login is desktop/laptop-only — phones are redirected back to the landing page.
const MOBILE_UA_REGEX = /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i;

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
    // Der Callback muss immer durchlaufen — auch mit bestehender Session, sonst
    // geht ein Einladungs-/Passwort-Link verloren, wenn im selben Browser noch
    // jemand angemeldet ist.
    const isCallbackRoute = pathname.startsWith("/auth/callback");
    const isAuthRoute    = pathname.startsWith("/login") || pathname.startsWith("/register") || isCallbackRoute;
    const isLandingRoute = pathname === "/";
    const isAdmin        = ADMIN_EMAILS.has(user?.email ?? "");

    const isLoginOrRegister = pathname.startsWith("/login") || pathname.startsWith("/register");
    if (isLoginOrRegister && MOBILE_UA_REGEX.test(request.headers.get("user-agent") ?? "")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (!user && !isAuthRoute && !isLandingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && !isCallbackRoute && (isAuthRoute || isLandingRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }

    if (user && pathname.startsWith("/admin") && !pathname.startsWith("/admin/org") && !isAdmin) {
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
