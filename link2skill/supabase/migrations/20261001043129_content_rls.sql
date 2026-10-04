-- Migration: Row Level Security for content_items and comments
--
-- Feature: link2skill-platform
-- Task 4.1 / 9.1 (content publishing)
-- Requirements: 6.1–6.9
--
-- content_items:
--   SELECT — any authenticated user can read Published/Approved content;
--            the owning tutor can read their own content in any status.
--   INSERT — only authenticated tutors (role check is app-layer; RLS just
--            confirms the row's tutor_id matches the caller).
--   UPDATE — only the owning tutor may update their own content.
--   DELETE — intentionally omitted; soft-delete via status = 'Deleted'.
--
-- comments:
--   SELECT — any authenticated user can read non-deleted comments.
--   INSERT — any authenticated user may post a comment (learner or tutor).
--   UPDATE — intentionally omitted (comments are immutable once posted).
--   DELETE — intentionally omitted; soft-delete via deleted_at.

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read Published or Approved content.
-- The owning tutor can read their own content regardless of status
-- (needed to manage drafts, scheduled, under-review content).
CREATE POLICY "content_items_select"
  ON public.content_items
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      status IN ('Published', 'Approved')
      OR tutor_id = auth.uid()
    )
  );

-- Only the owning tutor may insert their own content rows.
CREATE POLICY "content_items_insert_own"
  ON public.content_items
  FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

-- Only the owning tutor may update their own content.
CREATE POLICY "content_items_update_own"
  ON public.content_items
  FOR UPDATE
  USING  (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);

-- ── comments ──────────────────────────────────────────────────────────────

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read non-deleted comments.
CREATE POLICY "comments_select"
  ON public.comments
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND deleted_at IS NULL
  );

-- Any authenticated user may insert a comment.
CREATE POLICY "comments_insert"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Soft-delete: only the tutor who owns the content may set deleted_at.
-- This is enforced at the app layer; no RLS UPDATE policy is added here
-- because the app uses UPDATE … SET deleted_at to soft-delete comments
-- on the tutor's own content — the tutor_id check happens in the API route.
