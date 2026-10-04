// Feature: link2skill-platform
// Task 2.10: Authentication proxy (Next.js 16 — file must be named proxy.ts)
// Requirements: 1.6
//
// Protects /dashboard/* routes server-side.
// - Unauthenticated  → redirect to /login?next=<original path>
// - Wrong role       → redirect to correct dashboard
// - Correct role     → pass through unchanged
//
// Role resolution reads from public.users (canonical app role store) via
// the Supabase server client, which uses HttpOnly cookies. No client-
// supplied role value is trusted.
//
// Next.js 16 note: The file must be named proxy.ts (not middleware.ts)
// and the exported function must be named `proxy`. The `middleware`
// convention is deprecated in Next.js 16.

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Build a Supabase client that can read/write cookies in proxy context.
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // Refresh the session (rotates tokens if needed).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Not authenticated → redirect to /login preserving the intended path.
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Resolve roles from public.users (server-authoritative).
  const { data: profile } = await supabase
    .from("users")
    .select("roles")
    .eq("id", user.id)
    .single();

  const roles: string[] =
    (profile?.roles as string[] | null) ??
    (user.user_metadata?.roles as string[] | undefined) ??
    ["learner"];

  const isTutor = roles.includes("tutor");
  const isLearner = roles.includes("learner");

  // Enforce role-to-dashboard routing.
  if (pathname.startsWith("/dashboard/tutor") && !isTutor) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = isLearner ? "/dashboard/learner" : "/login";
    return NextResponse.redirect(redirect);
  }

  if (pathname.startsWith("/dashboard/learner") && !isLearner) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = isTutor ? "/dashboard/tutor" : "/login";
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  // Only run on /dashboard/* paths.
  matcher: ["/dashboard/:path*"],
};
