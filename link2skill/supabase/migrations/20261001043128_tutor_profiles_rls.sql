-- Migration: Row Level Security for public.tutor_profiles
--
-- Feature: link2skill-platform
-- Task 4.1: Tutor Profile CRUD
-- Requirements: 2.1, 2.2, 2.3, 2.8
--
-- Security model:
--   INSERT — only the authenticated user whose auth.uid() matches the profile
--             id may create a row.  The profile id must equal the user's own id
--             (a tutor's profile is keyed to their user id — 1:1 relationship).
--   SELECT — any authenticated user can read public profiles; only the owner
--             can read their own private profile.  Unauthenticated callers (anon
--             key without a session JWT) cannot read any row.
--   UPDATE — only the row owner (auth.uid() = id) may update their profile.
--   DELETE — intentionally omitted: profiles are deactivated via deactivated_at,
--             not physically deleted (Task 4.5, Requirement 2.9).

ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;

-- Tutors can insert their own profile row (id must equal caller's uid).
CREATE POLICY "tutor_profiles_insert_own"
  ON public.tutor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Any authenticated user can read public profiles.
-- Profile owners can always read their own profile regardless of visibility.
CREATE POLICY "tutor_profiles_select_public"
  ON public.tutor_profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      visibility = 'public'
      OR auth.uid() = id
    )
  );

-- Only the profile owner may update their own row.
CREATE POLICY "tutor_profiles_update_own"
  ON public.tutor_profiles
  FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
