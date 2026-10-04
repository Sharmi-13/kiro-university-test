// Feature: link2skill-platform
// Task 2.6: POST /api/auth/logout
// Requirements: 1.6

import { error, success } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function POST(): Promise<Response> {
  const supabase = await createClient();
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error("[logout] Supabase signOut error:", signOutError);
    return error("internal_error", "Logout failed. Please try again.", 500);
  }

  return success({ message: "Logged out successfully" });
}
