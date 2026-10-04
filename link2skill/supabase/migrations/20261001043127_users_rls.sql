-- Migration: Row Level Security for public.users
--
-- Supabase Cloud enables RLS on all tables by default, but it must be
-- explicitly enabled in migrations so that local dev (supabase start)
-- and CI environments are in an identical security posture.
--
-- Policies granted here:
--   SELECT  — authenticated users can read their own row (needed by the
--             server-side Supabase client in API routes, proxy, and dashboard
--             pages to resolve roles from the authoritative public.users table).
--   UPDATE  — authenticated users can update their own row (username, roles etc.)
--
-- INSERT is intentionally omitted: public.users rows are created exclusively
-- by the handle_new_user SECURITY DEFINER trigger, never by application code.
-- DELETE is intentionally omitted: handled by ON DELETE CASCADE from auth.users.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile row.
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile row.
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
