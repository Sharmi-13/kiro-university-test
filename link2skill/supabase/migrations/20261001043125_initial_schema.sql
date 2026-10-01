-- Link2Skill initial database schema
-- Authentication credentials, email verification, password reset,
-- sessions, and refresh tokens are managed by Supabase Auth.

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tutor_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(50) NOT NULL,
    biography TEXT,
    photo_url TEXT,
    subjects TEXT[] NOT NULL,
    languages TEXT[] NOT NULL,
    skill_levels TEXT[] NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    follower_count INTEGER NOT NULL DEFAULT 0,
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learner_preferences (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    languages TEXT[] NOT NULL,
    display_lang VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learner_subjects (
    learner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    skill_level VARCHAR(20) NOT NULL,
    PRIMARY KEY (learner_id, subject)
);

CREATE TABLE follows (
    learner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (learner_id, tutor_id)
);

CREATE TYPE content_type AS ENUM (
    'Post',
    'Video_Lesson'
);

CREATE TYPE content_status AS ENUM (
    'Draft',
    'Scheduled',
    'Published',
    'Under_Review',
    'Deleted',
    'Approved'
);

CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type content_type NOT NULL,
    title VARCHAR(150) NOT NULL,
    body TEXT,
    image_url TEXT,
    video_url TEXT,
    subject_tag VARCHAR(100) NOT NULL,
    language_tag VARCHAR(20) NOT NULL,
    skill_level VARCHAR(20) NOT NULL,
    status content_status NOT NULL DEFAULT 'Draft',
    publish_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    view_count INTEGER NOT NULL DEFAULT 0,
    save_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE saved_items (
    learner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (learner_id, content_id)
);

CREATE TABLE feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    score DECIMAL(10,4) NOT NULL DEFAULT 0,
    source VARCHAR(30) NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM (
    'new_content',
    'comment',
    'new_follower'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    new_content BOOLEAN NOT NULL DEFAULT TRUE,
    comment BOOLEAN NOT NULL DEFAULT TRUE,
    new_follower BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
    ON notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;
