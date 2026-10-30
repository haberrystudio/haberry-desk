import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    "https://gnkoxanhilpekggajdfc.supabase.co";

  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // If no anon key configured yet, pass through safely
  if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth token and get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Helper to construct redirect preserving cookies
  const createRedirectResponse = (destination: string) => {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = destination;
    redirectUrl.search = "";
    const res = NextResponse.redirect(redirectUrl);
    // Copy cookies so session updates persist
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie.name, cookie.value, cookie);
    });
    return res;
  };

  // Rule 1: If LOGGED IN
  // Block home page ("/") and auth pages ("/auth/sign-in", "/auth/sign-up") -> redirect to "/dashboard"
  if (user) {
    if (
      pathname === "/" ||
      pathname === "/auth/sign-in" ||
      pathname === "/auth/sign-up"
    ) {
      return createRedirectResponse("/dashboard");
    }
  }

  // Rule 2: If NOT LOGGED IN
  // Block dashboard ("/dashboard" and any sub-routes) -> redirect to "/auth/sign-in"
  if (!user) {
    if (pathname.startsWith("/dashboard")) {
      return createRedirectResponse("/auth/sign-in");
    }
  }

  return supabaseResponse;
}


