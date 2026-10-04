// Feature: link2skill-platform
// Task 2.4: POST /api/auth/login
// Requirements: 1.3, 1.4, 1.5

import { z } from "zod";

import { error, success, type FieldError } from "@/lib/api/response";
import { loginSchema } from "@/lib/auth/login-validation";
import { createClient } from "@/lib/supabase/server";

function zodFieldErrors(err: z.ZodError): FieldError[] {
  return err.issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
  }));
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("bad_request", "Request body must be valid JSON", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      "validation_failed",
      "One or more fields are invalid",
      422,
      zodFieldErrors(parsed.error),
    );
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    // Requirements 1.4: do not reveal whether email or password was incorrect.
    // Supabase returns "Invalid login credentials" for wrong email/password.
    // Account lockout (Req 1.5) is handled by Supabase GoTrue's rate-limiting.
    if (
      authError.message?.toLowerCase().includes("invalid login") ||
      authError.message?.toLowerCase().includes("invalid credentials") ||
      authError.message?.toLowerCase().includes("email not confirmed")
    ) {
      return error(
        "auth_failed",
        "The email or password you entered is incorrect.",
        401,
      );
    }

    if (authError.message?.toLowerCase().includes("too many requests")) {
      return error(
        "account_locked",
        "Too many failed attempts. Please try again later.",
        429,
      );
    }

    console.error("[login] Supabase signInWithPassword error:", authError);
    return error("internal_error", "Login failed. Please try again.", 500);
  }

  const user = authData.user;
  if (!user) {
    return error("internal_error", "Login failed. Please try again.", 500);
  }

  // Determine role from public.users (source of truth for app roles).
  // We do a quick fetch here so the response carries the role for client-side
  // routing. The middleware re-validates server-side on every protected request.
  const { data: profile } = await supabase
    .from("users")
    .select("roles")
    .eq("id", user.id)
    .single();

  const roles: string[] = profile?.roles ?? user.user_metadata?.roles ?? ["learner"];
  const primaryRole = roles.includes("tutor") ? "tutor" : "learner";

  return success({
    id: user.id,
    email: user.email,
    roles,
    primaryRole,
  });
}
