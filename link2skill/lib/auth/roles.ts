/**
 * Shared role-resolution helper.
 *
 * Reads the authoritative roles from public.users (server-side),
 * falling back to user_metadata then a safe default.
 *
 * This pattern is repeated across proxy.ts, dashboard pages, and API routes.
 * Centralising it removes duplication and makes the fallback chain explicit.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export async function resolveRoles(
  supabase: SupabaseClient,
  user: User,
): Promise<string[]> {
  const { data } = await supabase
    .from("users")
    .select("roles")
    .eq("id", user.id)
    .single();

  return (
    (data?.roles as string[] | null) ??
    (user.user_metadata?.roles as string[] | undefined) ??
    []
  );
}

export function isTutor(roles: string[]): boolean {
  return roles.includes("tutor");
}

export function isLearner(roles: string[]): boolean {
  return roles.includes("learner");
}
