# Technical Design Document: Link2Skill Platform

## Overview

Link2Skill is an AI-powered community learning platform that connects learners with tutors across Tamil and English educational content. The platform is built as a set of loosely-coupled microservices behind an API Gateway, with a React/React Native frontend. Each microservice owns its data, communicates asynchronously via an event bus (Apache Kafka), and exposes RESTful APIs consumed by the clients.

**Core design goals:**
- Bilingual first: Tamil Unicode support at every layer (storage, search, rendering, UI)
- Personalization: AI recommendation engine drives tutor discovery and feed curation
- Eventual consistency: follower counts, feed updates, and notification delivery tolerate short propagation delays within the SLAs defined in requirements
- Content safety: automated moderation pipeline with human review fallback
- Horizontal scalability: stateless services behind load balancers; caches reduce read pressure

---

## Architecture

### High-Level Architecture

Link2Skill follows a simple full-stack architecture designed for a web-based MVP.

```text
Learner / Tutor
        │
        ▼
Next.js Web Application
        │
        ▼
Next.js API Routes
        │
        ▼
Supabase (PostgreSQL + Auth + Storage)
        │
        ▼
AI Recommendation Module
```

### Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js + React |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| AI | OpenAI API + Kiro Agent |
| Deployment | Vercel |
### Communication Patterns

- **Synchronous (REST/HTTPS):** client-to-service and service-to-service calls requiring immediate responses (auth, profile reads, content submission)
- **Asynchronous (Kafka):** cross-service events after state changes (content published → feed update, moderation, notifications; follow → recommendation refresh)
- **Cache layer (Redis):** session tokens, feed page cache, follower counts, recommendation snapshots

---

## Components and Interfaces

### Auth Service

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account; triggers email verification |
| POST | `/auth/verify-email` | Confirm email with token |
| POST | `/auth/login` | Issue JWT access + refresh tokens |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/refresh` | Rotate access token using refresh token |
| POST | `/auth/password-reset/request` | Send one-time reset link |
| POST | `/auth/password-reset/confirm` | Apply new password, invalidate prior links |

**Session model:** Short-lived JWT access tokens (24 h) + longer-lived refresh tokens stored in a Redis deny-list for revocation. Each token embeds `userId`, `roles` (`learner`, `tutor`, or both), and `exp`.

**Account lockout:** Failed attempt count stored in Redis with a 15-minute TTL. After 5 consecutive failures the account is locked; the key expires automatically, releasing the lock.

**Email verification:** Signed HMAC token included in the verification URL, verified server-side before activating the account.

### Profile Service

**Tutor endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/profiles/tutors` | Create tutor profile |
| PUT | `/profiles/tutors/:id` | Update profile fields |
| GET | `/profiles/tutors/:id` | Fetch public tutor profile |
| DELETE | `/profiles/tutors/:id/deactivate` | Deactivate account (hides profile) |
| POST | `/profiles/tutors/:id/photo` | Upload profile photo (multipart) |

**Learner endpoints:**

| Method | Path | Description |
|---|---|---|
| PUT | `/profiles/learners/:id/preferences` | Update subjects, languages, skill levels |
| GET | `/profiles/learners/:id/preferences` | Fetch current preferences |

**Follow endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/profiles/tutors/:id/follow` | Follow a tutor |
| DELETE | `/profiles/tutors/:id/follow` | Unfollow a tutor |
| GET | `/profiles/tutors/:id/followers` | List followers (paginated) |

**Media upload:** Profile photos are streamed to S3-compatible object storage. File size checked before upload (reject > 5 MB). Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`.

### Content Service

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/content/posts` | Create post |
| PUT | `/content/posts/:id` | Edit post (not Under_Review) |
| DELETE | `/content/posts/:id` | Delete post |
| POST | `/content/videos` | Create video lesson (YouTube URL) |
| PUT | `/content/videos/:id` | Edit video lesson |
| DELETE | `/content/videos/:id` | Delete video lesson |
| GET | `/content/:id` | Fetch content item |

**YouTube URL validation:** URL is validated against the pattern `(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}` before acceptance. The oEmbed API is called to confirm the video exists and is embeddable.

**Scheduled publishing:** A cron worker polls `content` rows with `status = SCHEDULED` and `publish_at <= NOW()`. On match, it sets `status = PUBLISHED` and emits a `content.published` Kafka event.

### Feed Service

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/feed?page=&limit=` | Fetch paginated feed for authenticated learner |

**Feed assembly logic:**
1. Fetch followed-tutor content IDs from the profile service cache
2. Fetch recommendation content IDs from the recommendation engine snapshot (Redis)
3. Merge and score: `score = recency_weight × normalized_timestamp + relevance_weight × rec_score`
4. Apply language filter (learner preferred languages)
5. Boost items whose `skill_level` matches learner's per-subject preference
6. Paginate; cache page 1 in Redis for 60 seconds
7. Fall back to global trending (top 20 by engagement over 7 days) when no followed tutors and no preferences exist, or when the result count would be < 5

### Search Service

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/search/tutors?subject=&language=&skill_level=` | Search tutors |

**Elasticsearch index:** `tutors_v1` with per-field analyzers:
- `subject`, `bio`, `display_name`: `standard` analyzer (English) + `icu_analyzer` (Tamil via ICU plugin)
- `language`: keyword field
- `skill_level`: keyword field
- `visibility`: keyword field (filtered out in all queries for `private` profiles)
- `average_rating`: float (used for secondary sort)

**Ranking:** BM25 relevance score as primary sort; exact `subject` match boosted with `constant_score` query; `average_rating` as tiebreaker.

**Tamil query handling:** Queries are passed through Elasticsearch's ICU tokenizer; no client-side transliteration required. The `icu_analyzer` is applied both at index and query time.

### Recommendation Engine

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/recommendations/tutors/:learnerId` | Fetch ranked tutor list (up to 10) |
| POST | `/recommendations/tutors/:learnerId/refresh` | Trigger async re-computation |

**Algorithm — hybrid approach:**

1. **Content-based filtering:** embed learner's subjects + languages into a vector using a multilingual sentence-transformer model (e.g., `multilingual-e5-base`). Compute cosine similarity against pre-indexed tutor embedding vectors stored in a vector database.
2. **Collaborative filtering:** identify learners with similar follow histories using an approximate nearest-neighbour index; surface tutors followed by those peers but not yet followed by the target learner.
3. **Score fusion:** weighted sum of content-based score (0.6) + collaborative score (0.4), with a recency bonus for tutors who have published in the last 7 days.
4. **Filters applied before output:** exclude private profiles, exclude already-followed tutors, require at least one matching subject or language.
5. **Staleness handling:** last computed list stored in Redis with a staleness flag; returned immediately on timeout, marked stale.

### Content Moderator

**Internal service (no public endpoints). Triggered by Kafka event `content.published`.**

**Pipeline:**
1. Text analysis: call an LLM or dedicated classifier (e.g., OpenAI Moderation API or a self-hosted model) to score the content for policy violations (hate speech, explicit content, spam).
2. Image analysis (if attachment present): call an image moderation API (e.g., AWS Rekognition) to detect inappropriate imagery.
3. Decision:
   - Score < threshold → `APPROVED`; no status change
   - Score ≥ threshold → emit `content.flagged` event → Content Service sets status to `UNDER_REVIEW`; content hidden within 30 seconds
4. Human review queue: flagged items appear in a moderation dashboard. Reviewer resolves flag → `APPROVED` or `REMOVED`.

### Notification Service

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/notifications?page=&limit=` | Fetch inbox (unread first, max 100) |
| PUT | `/notifications/:id/read` | Mark notification as read |
| PUT | `/notifications/preferences` | Update per-type opt-in/opt-out |

**Fan-out strategy:** On `content.published`, `comment.created`, `follow.created` Kafka events the service:
1. Resolves the recipient list (all followers for content events, the tutor for comment/follow events)
2. Applies per-user preference gates (skip delivery if user has disabled that notification type)
3. Inserts notification rows into PostgreSQL
4. Pushes real-time delivery via WebSocket / Server-Sent Events using Redis Pub/Sub as the broadcast layer across horizontally scaled instances

**Retry:** If delivery fails (service unavailable), the Kafka consumer retries with exponential back-off. Pending notifications are stored in the DB and delivered when the service recovers, within the 120-second SLA.

---

## Data Models

### Auth Service — PostgreSQL

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}', -- 'learner', 'tutor'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_verifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE password_resets (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked    BOOLEAN NOT NULL DEFAULT FALSE
);
```

**Redis keys (Auth):**

| Key pattern | Value | TTL |
|---|---|---|
| `auth:lock:{userId}` | failed attempt count | 15 min |
| `auth:refresh_deny:{tokenId}` | `1` (revoked) | token expiry |

### Profile Service — PostgreSQL

```sql
CREATE TABLE tutor_profiles (
    id            UUID PRIMARY KEY REFERENCES users(id),
    display_name  VARCHAR(50) NOT NULL,
    biography     VARCHAR(500),
    photo_url     TEXT,
    subjects      TEXT[] NOT NULL,         -- max 10 elements enforced in app layer
    languages     TEXT[] NOT NULL,         -- 'Tamil', 'English'
    skill_levels  TEXT[] NOT NULL,         -- 'Beginner', 'Intermediate', 'Advanced'
    visibility    TEXT NOT NULL DEFAULT 'Public', -- 'Public' | 'Private'
    average_rating NUMERIC(3,2) DEFAULT 0,
    follower_count INT NOT NULL DEFAULT 0,
    deactivated_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learner_preferences (
    id           UUID PRIMARY KEY REFERENCES users(id),
    languages    TEXT[] NOT NULL DEFAULT '{}',
    display_lang TEXT NOT NULL DEFAULT 'English',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learner_subjects (
    learner_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    subject      TEXT NOT NULL,
    skill_level  TEXT NOT NULL,  -- 'Beginner' | 'Intermediate' | 'Advanced'
    PRIMARY KEY (learner_id, subject)
);

CREATE TABLE follows (
    learner_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id     UUID REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (learner_id, tutor_id)
);
```

**Redis keys (Profile):**

| Key pattern | Value | TTL |
|---|---|---|
| `profile:follower_count:{tutorId}` | integer count | 60 s (refreshed on write) |
| `profile:tutor:{tutorId}` | serialized profile JSON | 300 s |

### Content Service — PostgreSQL

```sql
CREATE TYPE content_type AS ENUM ('Post', 'Video_Lesson');
CREATE TYPE content_status AS ENUM ('Draft', 'Scheduled', 'Published', 'Under_Review', 'Deleted', 'Approved');

CREATE TABLE content_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id      UUID NOT NULL REFERENCES users(id),
    type          content_type NOT NULL,
    title         VARCHAR(150) NOT NULL,
    body          VARCHAR(2000),            -- NULL for Video_Lesson
    image_url     TEXT,                     -- optional for Post
    video_url     TEXT,                     -- YouTube URL for Video_Lesson
    subject_tag   TEXT NOT NULL,
    language_tag  TEXT NOT NULL,            -- 'Tamil' | 'English'
    skill_level   TEXT NOT NULL,
    status        content_status NOT NULL DEFAULT 'Draft',
    publish_at    TIMESTAMPTZ,              -- NULL = publish immediately
    published_at  TIMESTAMPTZ,
    view_count    INT NOT NULL DEFAULT 0,
    save_count    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id  UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id),
    body        VARCHAR(1000) NOT NULL,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE saved_items (
    learner_id  UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id  UUID REFERENCES content_items(id) ON DELETE CASCADE,
    saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (learner_id, content_id)
);
```

All text columns use `ENCODING UTF8` at the database level to ensure Tamil Unicode (`U+0B80`–`U+0BFF`) is stored and retrieved without transformation.

### Feed Service — PostgreSQL

```sql
CREATE TABLE feed_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id  UUID NOT NULL REFERENCES users(id),
    content_id  UUID NOT NULL REFERENCES content_items(id),
    score       NUMERIC(10,6) NOT NULL,
    source      TEXT NOT NULL,   -- 'follow' | 'recommendation' | 'trending'
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (learner_id, content_id)
);

CREATE INDEX idx_feed_learner_score ON feed_items(learner_id, score DESC);
```

**Redis keys (Feed):**

| Key pattern | Value | TTL |
|---|---|---|
| `feed:page1:{learnerId}` | JSON array of feed item stubs | 60 s |
| `trending:global` | JSON array of top-20 content IDs | 300 s |

### Notification Service — PostgreSQL

```sql
CREATE TYPE notification_type AS ENUM (
    'new_content',    -- followed tutor published
    'comment',        -- comment on own content
    'new_follower'    -- new follow
);

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    type        notification_type NOT NULL,
    payload     JSONB NOT NULL,   -- {actorId, contentId, contentTitle, ...}
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
    ON notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;

CREATE TABLE notification_preferences (
    user_id         UUID PRIMARY KEY REFERENCES users(id),
    new_content     BOOLEAN NOT NULL DEFAULT TRUE,
    comment         BOOLEAN NOT NULL DEFAULT TRUE,
    new_follower    BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Kafka Event Schema (key topics)

| Topic | Key | Payload fields |
|---|---|---|
| `content.published` | `contentId` | `contentId`, `tutorId`, `type`, `publishedAt`, `languageTag`, `skillLevel`, `subjectTag` |
| `content.deleted` | `contentId` | `contentId`, `tutorId` |
| `content.flagged` | `contentId` | `contentId`, `moderationScore`, `reason` |
| `follow.created` | `learnerId` | `learnerId`, `tutorId`, `createdAt` |
| `follow.removed` | `learnerId` | `learnerId`, `tutorId` |
| `comment.created` | `commentId` | `commentId`, `contentId`, `authorId`, `tutorId`, `contentTitle` |
| `preferences.updated` | `learnerId` | `learnerId`, `subjects`, `languages`, `skillLevels` |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Registration input validation produces valid accounts

*For any* registration payload containing a valid email, a unique username between 3 and 50 alphanumeric/underscore/hyphen characters, and a password meeting the complexity rule, the Auth_Service SHALL create exactly one account with the submitted roles and enqueue a verification email.

**Validates: Requirements 1.1, 1.8**

---

### Property 2: Duplicate email registration is always rejected

*For any* email address already associated with an existing account, a subsequent registration attempt using that same email SHALL return an error and leave the user count unchanged (idempotence of rejection).

**Validates: Requirements 1.2**

---

### Property 3: Invalid username constraints produce specific error messages

*For any* username that violates a constraint (fewer than 3 characters, more than 50 characters, or containing characters other than letters, digits, underscores, or hyphens), the Auth_Service SHALL reject the registration and return an error message identifying which specific constraint was violated.

**Validates: Requirements 1.9**

---

### Property 4: Successful login always issues a 24-hour session token

*For any* registered and email-verified user, submitting their correct credentials SHALL produce a JWT access token whose expiry is exactly 24 hours from the moment of issuance.

**Validates: Requirements 1.3**

---

### Property 5: Account lockout after 5 consecutive failures

*For any* registered user, after exactly 5 consecutive failed login attempts the account SHALL enter a locked state that rejects further login attempts, regardless of the username or password values used in those attempts.

**Validates: Requirements 1.5**

---

### Property 6: Expired tokens are always rejected

*For any* JWT access token whose `exp` claim is in the past, a request to any protected resource SHALL return a 401 Unauthorized response requiring re-authentication.

**Validates: Requirements 1.6**

---

### Property 7: Password reset invalidates all prior links

*For any* user who has previously requested one or more password reset links, issuing a new reset request SHALL invalidate all previously issued unexpired links for that account so that only the most recently issued link is valid at any time.

**Validates: Requirements 1.7**

---

### Property 8: Tutor profile validation rejects invalid inputs and accepts valid ones

*For any* tutor profile submission, if all required fields (display name within 2–50 characters, at least one subject, at least one language, at least one skill level) are present and within limits then the platform SHALL accept it; if any required field is missing or out of range then the platform SHALL reject it and identify each invalid field.

**Validates: Requirements 2.1, 2.3**

---

### Property 9: Tutor profile subjects are always bounded at 10

*For any* tutor profile, the subjects array SHALL never contain more than 10 elements; any attempt to add a subject to a profile that already has 10 subjects SHALL be rejected with an error indicating the 10-subject limit.

**Validates: Requirements 2.6, 2.7**

---

### Property 10: Private profiles never appear in search or recommendations

*For any* tutor profile with visibility set to Private, that profile SHALL be absent from every Search_Service result set and every Recommendation_Engine output list, regardless of the query or learner preferences used.

**Validates: Requirements 2.8, 4.3, 8.4**

---

### Property 11: Learner subject preferences are within the 1–10 bound

*For any* learner onboarding or preference update submission, if the subjects list contains between 1 and 10 elements then it SHALL be accepted and stored; if it contains 0 or more than 10 elements then it SHALL be rejected with an error indicating the constraint.

**Validates: Requirements 3.2, 3.6, 3.7**

---

### Property 12: Learner language preferences are stored and retrieved without transformation

*For any* valid language preference set submitted by a learner, retrieving that learner's preferences SHALL return a set containing exactly the languages submitted — no additions, removals, or alterations.

**Validates: Requirements 3.1**

---

### Property 13: Search results always satisfy all active filter criteria

*For any* search query containing one or more filter parameters (subject, language, skill level), every tutor profile returned in the results SHALL satisfy all active filter conditions, and no private profile SHALL be included.

**Validates: Requirements 4.1, 4.3, 4.5**

---

### Property 14: Exact subject matches rank above partial matches

*For any* search result set that contains both an exact subject match and a partial subject match for the same query, the exact match SHALL have a higher rank than any partial match of otherwise equal relevance.

**Validates: Requirements 4.4**

---

### Property 15: Search rejects invalid query parameters with specific errors

*For any* search request where a parameter value is invalid (subject string > 100 characters, or language/skill_level not in the system-defined list), the Search_Service SHALL reject the query and return an error message identifying which parameter is invalid.

**Validates: Requirements 4.7**

---

### Property 16: Follow is idempotent on follower count

*For any* learner–tutor pair, invoking the Follow action multiple consecutive times SHALL result in the same single Follow relationship and the same follower count as invoking it exactly once (duplicate follows are silently ignored).

**Validates: Requirements 5.8**

---

### Property 17: Follow/unfollow round-trip restores original feed membership

*For any* learner and tutor, after the learner follows and then immediately unfollows that tutor, content published by the tutor after the unfollow timestamp SHALL NOT appear in the learner's feed (the unfollow fully reverses the feed subscription).

**Validates: Requirements 5.1, 5.3**

---

### Property 18: Content submission validation identifies every invalid field

*For any* post or video lesson submission where one or more fields are empty, exceed their character/size limit, or fail format validation, the platform SHALL reject the submission without saving any content and the error response SHALL identify each invalid field.

**Validates: Requirements 6.1, 6.5**

---

### Property 19: YouTube URL validation rejects all non-conforming URLs

*For any* string that does not conform to the YouTube watch/short URL pattern (`youtube.com/watch?v={11-char-id}` or `youtu.be/{11-char-id}`), the Content Service SHALL reject the video lesson submission with an error message.

**Validates: Requirements 6.3**

---

### Property 20: Content edit is gated on status — Under_Review blocks edits

*For any* content item, if its current status is `Under_Review` then any edit attempt SHALL be rejected; if the status is `Published` or `Approved` then the edit SHALL succeed.

**Validates: Requirements 6.8**

---

### Property 21: Feed excludes content in non-preferred languages

*For any* learner and any feed page assembled for that learner, every item in the feed SHALL have a `language_tag` that is included in the learner's preferred languages list — no item in a non-preferred language SHALL appear.

**Validates: Requirements 7.2**

---

### Property 22: Feed ranks skill-level-matching items above equal-scored non-matching items

*For any* two feed items with identical recency and relevance scores, the item whose `skill_level` matches the learner's specified skill level for the corresponding subject SHALL appear before the non-matching item.

**Validates: Requirements 7.3**

---

### Property 23: Feed for learner with follows and preferences contains items from both sources

*For any* learner who has at least one active follow relationship and at least one learning preference, the assembled feed SHALL contain items from followed tutors and items from the recommendation engine, and the combined list SHALL be sorted by descending score.

**Validates: Requirements 7.1**

---

### Property 24: All tutor recommendations match at least one learner subject or language

*For any* learner preferences and any recommendation list generated for that learner, every recommended tutor in the list SHALL match at least one of the learner's preferred subjects or languages, and the list SHALL contain no more than 10 tutors.

**Validates: Requirements 8.1, 8.6**

---

### Property 25: Followed tutors are always excluded from recommendations

*For any* learner who follows a tutor, that tutor SHALL NOT appear in the recommendation list generated for that learner, regardless of how high their relevance score would otherwise be.

**Validates: Requirements 8.3, 8.5**

---

### Property 26: Tamil Unicode round-trip integrity

*For any* valid Tamil Unicode string (code points U+0B80–U+0BFF) stored as content, profile bio, comment, or UI label, retrieving that value SHALL produce a byte-identical Unicode string with no character substitution, normalization, or loss.

**Validates: Requirements 9.5**

---

### Property 27: Display language preference persists across sessions

*For any* user who selects a display language (Tamil or English) and then logs out and back in, the platform SHALL restore the previously selected display language without requiring re-selection.

**Validates: Requirements 9.7**

---

### Property 28: Browse results satisfy all applied filter combinations

*For any* combination of browse filters (language, skill level, content type), every content item returned in the browse results SHALL satisfy all active filter conditions simultaneously.

**Validates: Requirements 10.3**

---

### Property 29: Browse subject category results are sorted by rating then recency

*For any* subject category browse result set, items SHALL be sorted first by average rating descending, then by publication date descending where ratings are equal — no item with a lower rating SHALL precede an item with a higher rating.

**Validates: Requirements 10.2**

---

### Property 30: Saved Items collection never exceeds 500 items

*For any* learner, the saved items collection SHALL contain at most 500 items; any attempt to save a 501st item SHALL be rejected with an error indicating the collection is full, leaving the collection unchanged.

**Validates: Requirements 10.6**

---

### Property 31: Saved Items are always sorted by save date descending

*For any* learner's saved items collection, the items SHALL be returned sorted by `saved_at` timestamp in descending order — the most recently saved item SHALL always appear first.

**Validates: Requirements 10.8**

---

### Property 32: Engagement metrics are bounded to the 30-day rolling window

*For any* tutor, the aggregate engagement metrics (views, saves, follower growth) displayed on the Community page SHALL include only events whose timestamp falls within the 30-day window ending at the current date — no event outside that window SHALL contribute to the displayed totals.

**Validates: Requirements 11.2**

---

### Property 33: Comment length validation rejects out-of-range lengths

*For any* comment submission, if the body length is between 1 and 1000 characters inclusive then it SHALL be accepted; if the length is 0 or greater than 1000 then it SHALL be rejected with an error indicating the character limit requirement.

**Validates: Requirements 11.4, 11.5**

---

### Property 34: Disabled notification types are never delivered

*For any* user who has disabled a specific notification type, no notification of that type SHALL be created or delivered to that user after the preference is set, regardless of how many triggering events occur.

**Validates: Requirements 12.4, 12.5**

---

## Error Handling

### Auth Service

| Condition | HTTP Status | Behaviour |
|---|---|---|
| Duplicate email at registration | 409 Conflict | Generic error; no field disclosure |
| Invalid credentials | 401 Unauthorized | Generic message; no email/password distinction |
| Account locked | 423 Locked | Message states lock duration; no credential feedback |
| Expired/invalid JWT | 401 Unauthorized | Prompt re-authentication |
| Expired reset link | 400 Bad Request | Inform user link has expired; prompt new request |
| Email not yet verified | 403 Forbidden | Inform user to verify email |

### Profile Service

| Condition | HTTP Status | Behaviour |
|---|---|---|
| Missing required profile fields | 422 Unprocessable Entity | List each missing/invalid field by name |
| Photo > 5 MB | 413 Content Too Large | State 5 MB limit |
| Unsupported photo format | 415 Unsupported Media Type | List accepted formats |
| Subject limit exceeded | 422 Unprocessable Entity | State 10-subject limit |

### Content Service

| Condition | HTTP Status | Behaviour |
|---|---|---|
| Invalid YouTube URL | 422 Unprocessable Entity | Describe valid URL format |
| Field over limit or empty | 422 Unprocessable Entity | Identify each violating field |
| Edit on Under_Review content | 409 Conflict | State content is under review |
| Scheduled publish failure | Internal job | Retain Scheduled status; notify tutor via Notification_Service |

### Search Service

| Condition | HTTP Status | Behaviour |
|---|---|---|
| Invalid parameter values | 400 Bad Request | Identify the invalid parameter |
| Service timeout (> 2 s) | 503 Service Unavailable | Return error; no partial results |

### Feed Service

| Condition | Behaviour |
|---|---|
| Recommendation_Engine timeout (> 5 s) | Fall back to followed-tutor content only; no error state shown to learner |
| Feed < 5 items from follows + recommendations | Supplement with global trending content to reach minimum 10 |
| No follows and no preferences | Show top 20 globally trending items |

### Notification Service

| Condition | Behaviour |
|---|---|
| Delivery failure within 60 s | Retry at least once within 120 s of the trigger event |
| Service unavailable at publish time | Pending notifications stored in DB; delivered within 60 s of service recovery |

### General Patterns

- All API error responses follow a consistent JSON envelope: `{"error": {"code": "...", "message": "...", "fields": [...]}}`.
- Services do not expose internal stack traces or database errors to clients.
- Idempotency keys are accepted on POST endpoints to safely retry failed requests.
- All write operations are wrapped in database transactions; partial writes are rolled back.

---

## Testing Strategy

### Dual Testing Approach

The platform uses both **unit/example-based tests** and **property-based tests** in complementary roles:

- **Unit tests** verify specific scenarios, integration points, error conditions, and timing SLAs through integration tests.
- **Property tests** verify universal invariants across randomly generated inputs, covering the 34 correctness properties defined above.

### Property-Based Testing

**Library selection:**
- TypeScript/Node.js services: [fast-check](https://github.com/dubzzz/fast-check)
- Python services (Recommendation Engine): [Hypothesis](https://hypothesis.readthedocs.io/)

**Configuration:** Each property-based test runs a minimum of **100 iterations**. Each test is tagged with a comment referencing the design property:

```
// Feature: link2skill-platform, Property 1: Registration input validation produces valid accounts
```

**Generators required:**
- `validRegistrationPayload()` — valid email + valid username + compliant password + role subset
- `invalidUsername()` — usernames violating each constraint type (too short, too long, invalid chars)
- `tutorProfile()` — random profiles within and outside field limits
- `searchQuery()` — random filter combinations with valid and invalid values
- `contentItem()` — random posts and video lessons with valid and invalid fields
- `tamilUnicodeString()` — arbitrary strings in Tamil Unicode range (U+0B80–U+0BFF)
- `feedState()` — learner with random follows, preferences, and available content
- `commentBody(minLen, maxLen)` — strings of specified length range

### Unit and Integration Test Areas

**Auth Service:**
- Registration happy path and each validation error case
- Login with valid/invalid credentials; lockout counter
- Token expiry; refresh token rotation
- Password reset flow (issue, invalidate prior, use, expire)

**Profile Service:**
- Tutor profile CRUD; visibility toggle
- Learner preference storage and retrieval
- Follow/unfollow idempotency; duplicate follow handling
- Photo upload size and format rejection

**Content Service:**
- Post and Video_Lesson creation with all fields at boundary values
- YouTube URL acceptance and rejection patterns
- Scheduled publish cron job (unit test with time mock)
- Edit gating on Under_Review status

**Feed Service:**
- Feed assembly ordering (score computation)
- Language filter application
- Skill-level boost
- Fallback to trending; minimum 10 item guarantee

**Search Service:**
- Elasticsearch query construction for each filter type
- Tamil script query passes through without transliteration
- Private profile exclusion in all query paths

**Recommendation Engine:**
- Hybrid score fusion (unit test score calculation)
- Followed-tutor exclusion
- Private-profile exclusion
- Empty result handling

**Notification Service:**
- Per-type preference gating
- Fan-out to correct recipients
- Retry on delivery failure
- Unread inbox sort and 100-item cap

**Content Moderator:**
- Policy score threshold routing
- `UNDER_REVIEW` status transition on flag

### Timing SLA Integration Tests

The following SLAs are validated through dedicated integration tests with real service instances:

| SLA | Requirement |
|---|---|
| Verification email enqueued within 2 min | 1.1 |
| Profile changes visible to learners within 5 s | 2.2 |
| Deactivated profile hidden within 60 s | 2.9 |
| Recommendation refresh after preference update within 10 s | 3.4 |
| Search results returned within 2 s | 4.1 |
| Follower count updated within 10 s of follow/unfollow | 5.5 |
| Notification delivered within 60 s of publication | 5.6, 12.1–12.3 |
| Content deleted from feeds within 30 s | 6.9, 7.6 |
| Scheduled content published within 60 s of scheduled time | 6.10 |
| Under_Review content hidden within 30 s of flag | 6.7 |
| Feed next page loaded within 2 s | 7.4 |
| Recommendation regenerated within 10 s of follow/unfollow | 8.3 |
| UI language switch applies within 2 s | 9.2 |
| Browse results updated within 1 s of filter application | 10.4 |
| Comment deleted from list within 10 s | 11.7 |
| Notification read status updated within 5 s | 12.7 |
| Notification retry within 120 s of failure | 12.8 |
