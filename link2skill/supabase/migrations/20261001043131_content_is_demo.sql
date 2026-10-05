-- Migration: Add is_demo flag to content_items
--
-- Feature: link2skill-platform — shared demo data
--
-- Purpose:
--   Demo/seed content is seeded under one real tutor's UUID.
--   Without this flag every dashboard query (which filters by
--   tutor_id = auth.uid()) shows zero content to any other tutor.
--
--   Adding is_demo = true on seed rows lets application queries read
--   BOTH the logged-in tutor's own content AND shared demo rows in
--   a single query, without changing RLS or duplicating seed data.
--
-- RLS impact: none.
--   The existing "content_items_select" policy already permits any
--   authenticated user to read Published/Approved content regardless of
--   tutor_id.  The application-layer filter is what excluded demo rows;
--   this migration provides the flag the queries need to opt those rows in.
--
-- Existing rows default to false — no existing data is changed.

ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- Index so the OR filter (tutor_id = X OR is_demo = true) is efficient.
CREATE INDEX IF NOT EXISTS idx_content_items_is_demo
  ON public.content_items (is_demo)
  WHERE is_demo = true;

-- Back-fill: mark any rows whose title matches known seed titles as demo.
-- This handles the case where the seed was run before this migration.
-- Safe to run multiple times — idempotent.
UPDATE public.content_items
SET is_demo = true
WHERE title IN (
  'Introduction to Algebra',
  'கணிதம் — அடிப்படைகள்',
  'Understanding Quadratic Equations',
  'English Grammar: The Basics',
  'Introduction to Python Programming',
  'Newton''s Laws of Motion Explained',
  'C Programming — Pointers Explained',
  'Networking Basics — OSI Model',
  'The Periodic Table Explained',
  'English Speaking: Confidence Tips',
  'TCP/IP vs OSI — Key Differences',
  'Python Lists vs Tuples — When to Use Which',
  'Algebra Basics — Full Course',
  'Python Crash Course',
  'C Programming for Beginners',
  'English Speaking — Pronunciation Guide',
  'Networking Fundamentals Full Course',
  'Data Structures — Arrays and Lists',
  'Quadratic Equations — All Methods',
  'C Pointers — Visual Masterclass',
  'கணக்கு — வீடியோ பாடம் 1',
  'Subnetting — CIDR Made Simple',
  'Advanced Python — Decorators and Generators',
  'English Grammar — Tenses Complete Guide',
  'Python Generators — Draft',
  'Networking — VLANs Explained — Draft',
  'C Programming — Memory Management — Draft'
)
AND is_demo = false;
