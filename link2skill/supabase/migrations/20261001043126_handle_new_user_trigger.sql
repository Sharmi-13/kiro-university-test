-- Migration: handle_new_user trigger
--
-- Creates a database trigger that fires AFTER every INSERT on auth.users
-- and populates the corresponding public.users row.
--
-- Why a trigger instead of a direct API-layer insert:
--   When Supabase Auth email confirmation is enabled, signUp() returns no
--   session. The server route runs unauthenticated, so any INSERT it issues
--   against public.users is denied by RLS (no matching policy → default deny).
--   A SECURITY DEFINER trigger executes with the privileges of its owner
--   (postgres), bypassing RLS entirely, and the INSERT is guaranteed to be
--   atomic with the auth.users row creation.
--
-- username and roles are supplied by the registration route via
-- supabase.auth.signUp({ options: { data: { username, roles } } }),
-- which Supabase persists to auth.users.raw_user_meta_data.

-- -----------------------------------------------------------------------
-- Function
-- -----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  -- Pin search_path to prevent search-path injection attacks.
  SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_roles    TEXT[];
BEGIN
  -- Extract username from metadata; default to empty string so the NOT NULL
  -- constraint surfaces a clear DB error rather than a null-violation mystery.
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    ''
  );

  -- Extract roles array from metadata.
  -- raw_user_meta_data->'roles' is a JSONB array such as ["learner"] or
  -- ["learner","tutor"]. ARRAY(SELECT ...) converts it to a Postgres TEXT[].
  -- If the key is missing or null we fall back to the default learner role.
  v_roles := CASE
    WHEN NEW.raw_user_meta_data->'roles' IS NOT NULL
         AND jsonb_array_length(NEW.raw_user_meta_data->'roles') > 0
    THEN ARRAY(
      SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'roles')
    )
    ELSE ARRAY['learner']::TEXT[]
  END;

  INSERT INTO public.users (id, email, username, roles)
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_roles
  );

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------
-- Trigger
-- -----------------------------------------------------------------------

-- Drop first so re-running the migration (e.g. during local reset) is safe.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
