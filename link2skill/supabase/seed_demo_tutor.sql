-- Link2Skill Demo Seed — Tutor Portal
-- =========================================================
-- HOW TO RUN:
--   1. Log in to your Supabase project SQL Editor while authenticated
--      as any database user (service_role or postgres).
--   2. Paste this entire script and click Run.
--   3. The script uses auth.uid() to identify the currently-active
--      Supabase session, BUT the SQL Editor runs as postgres (not as
--      the tutor). So instead it looks up the most recently created
--      tutor-role user automatically — no manual UUID needed.
--
--   ALTERNATIVELY (recommended): Run via the Supabase SQL Editor after
--   finding your tutor UUID:
--     SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 5;
--   Then paste the UUID into the variable below if you want to target
--   a specific account.
--
-- IDEMPOTENT: Uses INSERT ... WHERE NOT EXISTS so it is safe to run
-- multiple times without creating duplicate records.
-- =========================================================

DO $$
DECLARE
  tutor_id      UUID;
  v_tutor_id    UUID;
  learner_ids   UUID[];
  learner_count INT;
BEGIN

  -- ── Step 1: Find the demo tutor automatically ────────────────────────
  -- Selects the most recently created user who has the 'tutor' role.
  -- If you want a specific user, replace this with:
  --   tutor_id := 'YOUR-UUID-HERE';
  SELECT id INTO tutor_id
  FROM public.users
  WHERE roles @> ARRAY['tutor']::text[]
  ORDER BY created_at DESC
  LIMIT 1;

  IF tutor_id IS NULL THEN
    RAISE EXCEPTION 'No tutor user found. Register as a tutor first, then re-run this script.';
  END IF;

  v_tutor_id := tutor_id;  -- alias used in INSERT to avoid column-name ambiguity

  RAISE NOTICE 'Seeding demo data for tutor: %', tutor_id;

  -- ── Step 2: Ensure tutor profile exists with realistic data ──────────
  INSERT INTO public.tutor_profiles
    (id, display_name, biography, subjects, languages, skill_levels,
     visibility, follower_count, average_rating, created_at, updated_at)
  VALUES (
    tutor_id,
    'Demo Tutor',
    'Experienced educator with 8+ years teaching Mathematics, Python, and English. Passionate about making complex topics accessible for every learner. Teaches in both Tamil and English.',
    ARRAY['Mathematics', 'Python', 'English', 'C Programming', 'Networking'],
    ARRAY['Tamil', 'English'],
    ARRAY['Beginner', 'Intermediate', 'Advanced'],
    'public',
    128,
    4.70,
    NOW() - INTERVAL '60 days',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name   = EXCLUDED.display_name,
        biography      = EXCLUDED.biography,
        subjects       = EXCLUDED.subjects,
        languages      = EXCLUDED.languages,
        skill_levels   = EXCLUDED.skill_levels,
        follower_count = 128,
        average_rating = 4.70,
        updated_at     = NOW();

  -- ── Step 3: Published posts (12) ─────────────────────────────────────
  INSERT INTO public.content_items
    (tutor_id, type, title, body, subject_tag, language_tag, skill_level,
     status, published_at, view_count, save_count, is_demo, created_at, updated_at)
  SELECT * FROM (VALUES
    (tutor_id::UUID, 'Post'::content_type, 'Introduction to Algebra',
     'Master the fundamentals of algebra with step-by-step examples.',
     'Mathematics', 'English', 'Beginner', 'Published'::content_status,
     NOW()-INTERVAL '28 days', 312, 48, true, NOW()-INTERVAL '28 days', NOW()),

    (tutor_id, 'Post', 'கணிதம் — அடிப்படைகள்',
     'இந்த பாடம் கணிதத்தின் அடிப்படை கருத்துக்களை விளக்குகிறது.',
     'Mathematics', 'Tamil', 'Beginner', 'Published',
     NOW()-INTERVAL '26 days', 287, 41, true, NOW()-INTERVAL '26 days', NOW()),

    (tutor_id, 'Post', 'Understanding Quadratic Equations',
     'Solve quadratic equations using factoring, completing the square, and the quadratic formula.',
     'Mathematics', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '24 days', 198, 32, true, NOW()-INTERVAL '24 days', NOW()),

    (tutor_id, 'Post', 'English Grammar: The Basics',
     'A comprehensive guide to English grammar rules for beginners.',
     'English', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '22 days', 445, 67, true, NOW()-INTERVAL '22 days', NOW()),

    (tutor_id, 'Post', 'Introduction to Python Programming',
     'Your first steps in Python — variables, loops, and functions.',
     'Python', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '16 days', 389, 56, true, NOW()-INTERVAL '16 days', NOW()),

    (tutor_id, 'Post', 'Newton''s Laws of Motion Explained',
     'A clear, visual explanation of Newton''s three laws with real-world examples.',
     'Science', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '18 days', 267, 38, true, NOW()-INTERVAL '18 days', NOW()),

    (tutor_id, 'Post', 'C Programming — Pointers Explained',
     'Demystifying pointers in C with diagrams and practical examples.',
     'C Programming', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '14 days', 234, 29, true, NOW()-INTERVAL '14 days', NOW()),

    (tutor_id, 'Post', 'Networking Basics — OSI Model',
     'Understanding the 7-layer OSI model with real-world analogies.',
     'Networking', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '12 days', 178, 24, true, NOW()-INTERVAL '12 days', NOW()),

    (tutor_id, 'Post', 'The Periodic Table Explained',
     'Understanding elements, groups, and periods in the periodic table.',
     'Science', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '10 days', 156, 19, true, NOW()-INTERVAL '10 days', NOW()),

    (tutor_id, 'Post', 'English Speaking: Confidence Tips',
     'Practical exercises to speak English with confidence in daily situations.',
     'English', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '6 days', 143, 21, true, NOW()-INTERVAL '6 days', NOW()),

    (tutor_id, 'Post', 'TCP/IP vs OSI — Key Differences',
     'A side-by-side comparison of the TCP/IP and OSI networking models.',
     'Networking', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '4 days', 112, 17, true, NOW()-INTERVAL '4 days', NOW()),

    (tutor_id, 'Post', 'Python Lists vs Tuples — When to Use Which',
     'A practical guide to choosing between lists and tuples in Python.',
     'Python', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '2 days', 98, 14, true, NOW()-INTERVAL '2 days', NOW())
  ) AS v(tutor_id, type, title, body, subject_tag, language_tag, skill_level,
          status, published_at, view_count, save_count, is_demo, created_at, updated_at)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.content_items ci
    WHERE ci.tutor_id = v.tutor_id AND ci.title = v.title
  );

  -- ── Step 4: Published video lessons (12) ─────────────────────────────
  INSERT INTO public.content_items
    (tutor_id, type, title, body, video_url, subject_tag, language_tag,
     skill_level, status, published_at, view_count, save_count, is_demo, created_at, updated_at)
  SELECT * FROM (VALUES
    (tutor_id::UUID, 'Video_Lesson'::content_type, 'Algebra Basics — Full Course',
     'Complete beginner algebra course with practice problems.',
     'https://www.youtube.com/watch?v=NybHckSEQBI',
     'Mathematics', 'English', 'Beginner', 'Published'::content_status,
     NOW()-INTERVAL '27 days', 521, 78, true, NOW()-INTERVAL '27 days', NOW()),

    (tutor_id, 'Video_Lesson', 'Python Crash Course',
     'Build your first Python programme in 30 minutes.',
     'https://www.youtube.com/watch?v=rfscVS0vtbw',
     'Python', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '23 days', 612, 94, true, NOW()-INTERVAL '23 days', NOW()),

    (tutor_id, 'Video_Lesson', 'C Programming for Beginners',
     'Complete introduction to C programming — variables, loops, functions.',
     'https://www.youtube.com/watch?v=KJgsSFOSQv0',
     'C Programming', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '21 days', 287, 39, true, NOW()-INTERVAL '21 days', NOW()),

    (tutor_id, 'Video_Lesson', 'English Speaking — Pronunciation Guide',
     'Perfect your English pronunciation with guided exercises.',
     'https://www.youtube.com/watch?v=dEev-Yp9zj0',
     'English', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '19 days', 498, 72, true, NOW()-INTERVAL '19 days', NOW()),

    (tutor_id, 'Video_Lesson', 'Networking Fundamentals Full Course',
     'Everything you need to know about computer networking.',
     'https://www.youtube.com/watch?v=qiQR5rTSshw',
     'Networking', 'English', 'Beginner', 'Published',
     NOW()-INTERVAL '17 days', 201, 28, true, NOW()-INTERVAL '17 days', NOW()),

    (tutor_id, 'Video_Lesson', 'Data Structures — Arrays and Lists',
     'Visual introduction to arrays, linked lists, and stacks.',
     'https://www.youtube.com/watch?v=RBSGKlAvoiM',
     'Python', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '15 days', 356, 54, true, NOW()-INTERVAL '15 days', NOW()),

    (tutor_id, 'Video_Lesson', 'Quadratic Equations — All Methods',
     'Every method for solving quadratic equations in one video.',
     'https://www.youtube.com/watch?v=zc2CpyRtjvY',
     'Mathematics', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '13 days', 244, 36, true, NOW()-INTERVAL '13 days', NOW()),

    (tutor_id, 'Video_Lesson', 'C Pointers — Visual Masterclass',
     'Pointers explained with memory diagrams and live coding.',
     'https://www.youtube.com/watch?v=zuegQmMdy8M',
     'C Programming', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '11 days', 189, 23, true, NOW()-INTERVAL '11 days', NOW()),

    (tutor_id, 'Video_Lesson', 'கணக்கு — வீடியோ பாடம் 1',
     'கணிதத்தில் முதல் அடிகள் — தமிழில்.',
     'https://www.youtube.com/watch?v=NybHckSEQBI',
     'Mathematics', 'Tamil', 'Beginner', 'Published',
     NOW()-INTERVAL '9 days', 334, 51, true, NOW()-INTERVAL '9 days', NOW()),

    (tutor_id, 'Video_Lesson', 'Subnetting — CIDR Made Simple',
     'Master IP subnetting and CIDR notation step by step.',
     'https://www.youtube.com/watch?v=BWZ-MHIhqjM',
     'Networking', 'English', 'Advanced', 'Published',
     NOW()-INTERVAL '7 days', 167, 25, true, NOW()-INTERVAL '7 days', NOW()),

    (tutor_id, 'Video_Lesson', 'Advanced Python — Decorators and Generators',
     'Master Python decorators and generators with practical examples.',
     'https://www.youtube.com/watch?v=MYAEv3JoenI',
     'Python', 'English', 'Advanced', 'Published',
     NOW()-INTERVAL '4 days', 278, 43, true, NOW()-INTERVAL '4 days', NOW()),

    (tutor_id, 'Video_Lesson', 'English Grammar — Tenses Complete Guide',
     'All 12 English tenses explained clearly with examples.',
     'https://www.youtube.com/watch?v=i5iGB7n0V58',
     'English', 'English', 'Intermediate', 'Published',
     NOW()-INTERVAL '1 day', 134, 18, true, NOW()-INTERVAL '1 day', NOW())
  ) AS v(tutor_id, type, title, body, video_url, subject_tag, language_tag,
          skill_level, status, published_at, view_count, save_count, is_demo, created_at, updated_at)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.content_items ci
    WHERE ci.tutor_id = v.tutor_id AND ci.title = v.title
  );

  -- ── Step 5: Draft content (3) ─────────────────────────────────────────
  INSERT INTO public.content_items
    (tutor_id, type, title, body, subject_tag, language_tag, skill_level,
     status, is_demo, created_at, updated_at)
  SELECT * FROM (VALUES
    (tutor_id::UUID, 'Post'::content_type,
     'Python Generators — Draft',
     'Working draft on Python generators and the yield keyword.',
     'Python', 'English', 'Advanced', 'Draft'::content_status, true,
     NOW()-INTERVAL '1 day', NOW()),

    (tutor_id, 'Post',
     'Networking — VLANs Explained — Draft',
     'Draft notes on Virtual LANs and their use in enterprise networking.',
     'Networking', 'English', 'Intermediate', 'Draft', true,
     NOW()-INTERVAL '3 hours', NOW()),

    (tutor_id, 'Video_Lesson',
     'C Programming — Memory Management — Draft',
     'Planned video on malloc, free, and memory leaks in C.',
     'C Programming', 'English', 'Advanced', 'Draft', true,
     NOW()-INTERVAL '30 minutes', NOW())
  ) AS v(tutor_id, type, title, body, subject_tag, language_tag, skill_level,
          status, is_demo, created_at, updated_at)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.content_items ci
    WHERE ci.tutor_id = v.tutor_id AND ci.title = v.title
  );

  -- ── Step 6: Follows — use only EXISTING learner users ───────────────
  -- public.users.id has a FK to auth.users(id) ON DELETE CASCADE, so we
  -- cannot insert phantom rows.  Instead we query the real public.users
  -- table for accounts that already have the 'learner' role, excluding
  -- the tutor themselves, and follow up to 5 of them.
  -- If zero learners exist the loop simply does nothing — seed stays safe.

  SELECT ARRAY(
    SELECT id FROM public.users
    WHERE roles @> ARRAY['learner']::text[]
      AND id <> tutor_id
    ORDER BY created_at
    LIMIT 5
  ) INTO learner_ids;

  learner_count := COALESCE(array_length(learner_ids, 1), 0);

  -- Insert one follow row per discovered learner (skip duplicates).
  -- Use v_tutor_id (not tutor_id) to avoid 42702 column-name ambiguity
  -- with follows.tutor_id inside the INSERT statement.
  FOR i IN 1..learner_count LOOP
    IF NOT EXISTS (
    SELECT 1
    FROM public.follows
    WHERE public.follows.learner_id = learner_ids[i]
      AND public.follows.tutor_id = v_tutor_id
) THEN
    INSERT INTO public.follows (learner_id, tutor_id, created_at)
    VALUES (
        learner_ids[i],
        v_tutor_id,
        NOW() - (INTERVAL '5 days' * i)
    );
END IF;
  END LOOP;

  RAISE NOTICE 'Created % follow relationship(s).', learner_count;

  -- ── Step 8: Notifications (for this tutor) ───────────────────────────
  INSERT INTO public.notifications (user_id, type, payload, is_read, created_at)
  VALUES
    (tutor_id, 'new_follower',
     jsonb_build_object('follower_username', 'rahul_learns', 'message', 'rahul_learns started following you'),
     false, NOW()-INTERVAL '13 days'),

    (tutor_id, 'new_follower',
     jsonb_build_object('follower_username', 'priya_student', 'message', 'priya_student started following you'),
     false, NOW()-INTERVAL '5 days'),

    (tutor_id, 'comment',
     jsonb_build_object('author_username', 'arun_coding', 'content_title', 'Python Crash Course',
                        'message', 'arun_coding commented on your video "Python Crash Course"'),
     false, NOW()-INTERVAL '3 days'),

    (tutor_id, 'comment',
     jsonb_build_object('author_username', 'kavitha_maths', 'content_title', 'Introduction to Algebra',
                        'message', 'kavitha_maths commented on your post "Introduction to Algebra"'),
     true, NOW()-INTERVAL '10 days'),

    (tutor_id, 'new_follower',
     jsonb_build_object('follower_username', 'senthil_network', 'message', 'senthil_network started following you'),
     true, NOW()-INTERVAL '12 days');

  -- ── Step 9: Update follower_count to match actual follows rows ────────
  
UPDATE public.tutor_profiles
SET
    follower_count = (
        SELECT COUNT(*)
        FROM public.follows f
        WHERE f.tutor_id = v_tutor_id
    ),
    updated_at = NOW()
WHERE public.tutor_profiles.id = v_tutor_id;

RAISE NOTICE 'Demo seed complete for tutor %. Profile, 27 content items, follows (up to 5), 5 notifications inserted.', tutor_id;

END $$;