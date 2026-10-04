-- Link2Skill Demo Seed — Tutor Portal
-- Run this ONCE against your Supabase project to seed demo data for a tutor account.
--
-- BEFORE RUNNING:
--   1. Log in to the app as the demo tutor.
--   2. Create a tutor profile via /dashboard/tutor/profile.
--   3. Replace :TUTOR_USER_ID below with the actual UUID of that tutor.
--      Find it in: Supabase Dashboard → Authentication → Users.
--
-- This script seeds:
--   - 12 published posts
--   - 12 published video lessons
--   - Realistic view_count and save_count values
--   - Updates tutor_profiles.follower_count and average_rating
--
-- It is idempotent — running it twice inserts duplicate titles but does not break anything.
-- To avoid duplication, run it only once per demo account.

-- ── Replace this with the real tutor's UUID ───────────────────────────────
DO $$
DECLARE
  tutor_id UUID := 'REPLACE_WITH_TUTOR_UUID';  -- <── paste UUID here
BEGIN

  -- ── Posts (12) ──────────────────────────────────────────────────────────

  INSERT INTO public.content_items
    (tutor_id, type, title, body, subject_tag, language_tag, skill_level, status, published_at, view_count, save_count, created_at, updated_at)
  VALUES
    (tutor_id, 'Post', 'Introduction to Algebra',                     'Master the fundamentals of algebra with step-by-step examples.',                                'Mathematics',   'English', 'Beginner',     'Published', NOW() - INTERVAL '28 days', 312,  48,  NOW() - INTERVAL '28 days', NOW()),
    (tutor_id, 'Post', 'கணிதம் — அடிப்படைகள்',                        'இந்த பாடம் கணிதத்தின் அடிப்படை கருத்துக்களை விளக்குகிறது.',                                    'Mathematics',   'Tamil',   'Beginner',     'Published', NOW() - INTERVAL '26 days', 287,  41,  NOW() - INTERVAL '26 days', NOW()),
    (tutor_id, 'Post', 'Understanding Quadratic Equations',            'Solve quadratic equations using factoring, completing the square, and the quadratic formula.',  'Mathematics',   'English', 'Intermediate', 'Published', NOW() - INTERVAL '24 days', 198,  32,  NOW() - INTERVAL '24 days', NOW()),
    (tutor_id, 'Post', 'English Grammar: The Basics',                  'A comprehensive guide to English grammar rules for beginners.',                                  'English',       'English', 'Beginner',     'Published', NOW() - INTERVAL '22 days', 445,  67,  NOW() - INTERVAL '22 days', NOW()),
    (tutor_id, 'Post', 'ஆங்கில இலக்கணம் — எளிய வழிகாட்டி',          'ஆரம்பநிலை மாணவர்களுக்கான ஆங்கில இலக்கண விதிகள்.',                                           'English',       'Tamil',   'Beginner',     'Published', NOW() - INTERVAL '20 days', 321,  44,  NOW() - INTERVAL '20 days', NOW()),
    (tutor_id, 'Post', 'Newton''s Laws of Motion Explained',          'A clear, visual explanation of Newton''s three laws with real-world examples.',                  'Physics',       'English', 'Intermediate', 'Published', NOW() - INTERVAL '18 days', 267,  38,  NOW() - INTERVAL '18 days', NOW()),
    (tutor_id, 'Post', 'Introduction to Python Programming',           'Your first steps in Python — variables, loops, and functions.',                                  'Programming',   'English', 'Beginner',     'Published', NOW() - INTERVAL '16 days', 389,  56,  NOW() - INTERVAL '16 days', NOW()),
    (tutor_id, 'Post', 'தமிழ் இலக்கணம் — எழுத்துகள்',               'தமிழ் எழுத்துக்களின் வகைகளும் உச்சரிப்பும்.',                                                  'Tamil Language','Tamil',   'Beginner',     'Published', NOW() - INTERVAL '14 days', 234,  29,  NOW() - INTERVAL '14 days', NOW()),
    (tutor_id, 'Post', 'Solving Linear Equations Step by Step',       'From simple one-variable equations to systems of equations.',                                     'Mathematics',   'English', 'Intermediate', 'Published', NOW() - INTERVAL '12 days', 178,  24,  NOW() - INTERVAL '12 days', NOW()),
    (tutor_id, 'Post', 'The Periodic Table Explained',                'Understanding elements, groups, and periods in the periodic table.',                              'Science',       'English', 'Beginner',     'Published', NOW() - INTERVAL '10 days', 156,  19,  NOW() - INTERVAL '10 days', NOW()),
    (tutor_id, 'Post', 'Creative Writing: Finding Your Voice',        'Tips and exercises to develop your unique writing style.',                                         'English',       'English', 'Advanced',     'Published', NOW() - INTERVAL '6 days',  143,  21,  NOW() - INTERVAL '6 days',  NOW()),
    (tutor_id, 'Post', 'வரலாறு — சங்க காலம்',                        'சங்க இலக்கியங்களும் அக்கால வாழ்க்கை முறையும்.',                                               'History',       'Tamil',   'Intermediate', 'Published', NOW() - INTERVAL '3 days',  98,   12,  NOW() - INTERVAL '3 days',  NOW());

  -- ── Video Lessons (12) ──────────────────────────────────────────────────

  INSERT INTO public.content_items
    (tutor_id, type, title, body, video_url, subject_tag, language_tag, skill_level, status, published_at, view_count, save_count, created_at, updated_at)
  VALUES
    (tutor_id, 'Video_Lesson', 'Algebra Basics — Full Course',        'Complete beginner algebra course with practice problems.',  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Mathematics',   'English', 'Beginner',     'Published', NOW() - INTERVAL '27 days', 521, 78,  NOW() - INTERVAL '27 days', NOW()),
    (tutor_id, 'Video_Lesson', 'கணக்கு — வீடியோ பாடம் 1',          'கணிதத்தில் முதல் அடிகள் — தமிழில்.',               'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Mathematics',   'Tamil',   'Beginner',     'Published', NOW() - INTERVAL '25 days', 334, 51,  NOW() - INTERVAL '25 days', NOW()),
    (tutor_id, 'Video_Lesson', 'Python Crash Course',                 'Build your first Python programme in 30 minutes.',          'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Programming',   'English', 'Beginner',     'Published', NOW() - INTERVAL '23 days', 612, 94,  NOW() - INTERVAL '23 days', NOW()),
    (tutor_id, 'Video_Lesson', 'Physics — Kinematics Masterclass',   'Motion, velocity, and acceleration solved visually.',       'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Physics',       'English', 'Intermediate', 'Published', NOW() - INTERVAL '21 days', 287, 39,  NOW() - INTERVAL '21 days', NOW()),
    (tutor_id, 'Video_Lesson', 'English Speaking — Pronunciation',   'Perfect your English pronunciation with guided exercises.',  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'English',       'English', 'Beginner',     'Published', NOW() - INTERVAL '19 days', 498, 72,  NOW() - INTERVAL '19 days', NOW()),
    (tutor_id, 'Video_Lesson', 'தமிழ் — கவிதை பாடல்கள்',           'தமிழ் கவிதைகளை படிக்கவும் புரிந்துகொள்ளவும்.',    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Tamil Language','Tamil',   'Intermediate', 'Published', NOW() - INTERVAL '17 days', 201, 28,  NOW() - INTERVAL '17 days', NOW()),
    (tutor_id, 'Video_Lesson', 'Data Structures — Arrays & Lists',   'Visual introduction to arrays, linked lists, and stacks.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Programming',   'English', 'Intermediate', 'Published', NOW() - INTERVAL '15 days', 356, 54,  NOW() - INTERVAL '15 days', NOW()),
    (tutor_id, 'Video_Lesson', 'Quadratic Equations — Solved',       'Every method for solving quadratic equations in one video.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Mathematics',   'English', 'Intermediate', 'Published', NOW() - INTERVAL '13 days', 244, 36,  NOW() - INTERVAL '13 days', NOW()),
    (tutor_id, 'Video_Lesson', 'Chemistry — Atomic Structure',       'Protons, neutrons, electrons — the atom explained clearly.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Science',       'English', 'Beginner',     'Published', NOW() - INTERVAL '11 days', 189, 23,  NOW() - INTERVAL '11 days', NOW()),
    (tutor_id, 'Video_Lesson', 'Music Theory for Beginners',         'Read sheet music, understand scales and chords.',           'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Music',         'English', 'Beginner',     'Published', NOW() - INTERVAL '8 days',  167, 25,  NOW() - INTERVAL '8 days',  NOW()),
    (tutor_id, 'Video_Lesson', 'Advanced Python — Decorators',       'Master Python decorators and functional programming.',      'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Programming',   'English', 'Advanced',     'Published', NOW() - INTERVAL '5 days',  278, 43,  NOW() - INTERVAL '5 days',  NOW()),
    (tutor_id, 'Video_Lesson', 'Carnatic Music Basics — தமிழில்',   'கர்நாடக இசையின் அடிப்படைகள் — தமிழ் வழி.',       'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Music',         'Tamil',   'Beginner',     'Published', NOW() - INTERVAL '2 days',  134, 18,  NOW() - INTERVAL '2 days',  NOW());

  -- ── Update tutor profile metrics ─────────────────────────────────────────

  UPDATE public.tutor_profiles
  SET
    follower_count  = 128,
    average_rating  = 4.70,
    updated_at      = NOW()
  WHERE id = tutor_id;

END $$;
