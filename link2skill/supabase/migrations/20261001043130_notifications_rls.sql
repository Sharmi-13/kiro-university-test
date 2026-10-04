-- Migration: Row Level Security for notifications and notification_preferences
--
-- Feature: link2skill-platform
-- Task 18.1 / 18.3 (notifications)
-- Requirements: 12.1–12.8
--
-- notifications:
--   SELECT — users can only read their own notifications.
--   UPDATE — users can only update (mark read) their own notifications.
--   INSERT — intentionally omitted from RLS; notification rows are created
--            server-side by the Notification Service, not by end-users.
--
-- notification_preferences:
--   SELECT — users can read their own preferences.
--   INSERT — users can create their own preferences row (upsert pattern).
--   UPDATE — users can update their own preferences.

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── notification_preferences ──────────────────────────────────────────────

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_prefs_select_own"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notif_prefs_insert_own"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notif_prefs_update_own"
  ON public.notification_preferences
  FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── follows ───────────────────────────────────────────────────────────────
-- Tutors need to read follows to show their follower count and list.

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read follow relationships
-- (needed for community pages and follower lists).
CREATE POLICY "follows_select"
  ON public.follows
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Learners can follow tutors (insert their own follow rows).
CREATE POLICY "follows_insert_own"
  ON public.follows
  FOR INSERT
  WITH CHECK (auth.uid() = learner_id);

-- Learners can unfollow (delete their own follow rows).
CREATE POLICY "follows_delete_own"
  ON public.follows
  FOR DELETE
  USING (auth.uid() = learner_id);
