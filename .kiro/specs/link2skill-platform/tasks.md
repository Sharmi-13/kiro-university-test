# Implementation Plan: Link2Skill Platform

## Overview

Incremental implementation of the Link2Skill Next.js + Supabase web application. Tasks are ordered so each step produces working, integrated code that builds on the previous one. Property-based tests use `fast-check` and are placed close to the implementation they validate.

---

## Tasks

- [ ] 1. Project scaffolding and shared infrastructure
  - [ ] 1.1 Initialise Next.js project with TypeScript, configure Supabase client, set up environment variable schema with `@t3-oss/env-nextjs`, and add ESLint + Prettier
    - Create `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server-side) Supabase client factories
    - Add `lib/types/index.ts` exporting all shared TypeScript types and enums derived from the data models (UserRole, ContentType, ContentStatus, SkillLevel, NotificationType, etc.)
    - _Requirements: All_

  - [ ] 1.2 Apply Supabase database migrations for all tables defined in the design
    - Create migration files for `users`, `email_verifications`, `password_resets`, `refresh_tokens`, `tutor_profiles`, `learner_preferences`, `learner_subjects`, `follows`, `content_items`, `comments`, `saved_items`, `feed_items`, `notifications`, `notification_preferences`
    - Enable `pgcrypto` extension; set database encoding to `UTF8`
    - _Requirements: 1.1, 2.1, 3.1, 6.1, 7.1, 10.6, 11.1, 12.6_

  - [ ] 1.3 Create shared API response helpers and error envelope factory
    - Implement `lib/api/response.ts` with typed `success()` and `error()` wrappers that emit `{"error": {"code": "...", "message": "...", "fields": [...]}}` on failure
    - _Requirements: All (error handling)_

  - [ ]* 1.4 Write unit tests for error envelope factory
    - Verify `error()` shape and `success()` shape match the design contract
    - _Requirements: All (error handling)_

- [ ] 2. Authentication
  - [ ] 2.1 Implement registration API route (`POST /api/auth/register`)
    - Validate email, username (3–50 chars, `[A-Za-z0-9_-]` only), and password (≥8 chars, upper + lower + digit)
    - Call Supabase Auth `signUp`; insert user row; generate HMAC email verification token; enqueue verification email via Supabase Edge Function or email provider
    - Return 409 on duplicate email (generic message, no field disclosure)
    - _Requirements: 1.1, 1.2, 1.8, 1.9_

  - [ ]* 2.2 Write property test for registration input validation (fast-check)
    - **Property 1: Registration input validation produces valid accounts**
    - **Property 2: Duplicate email registration is always rejected**
    - **Property 3: Invalid username constraints produce specific error messages**
    - **Validates: Requirements 1.1, 1.2, 1.9**

  - [ ] 2.3 Implement email verification API route (`POST /api/auth/verify-email`)
    - Look up `email_verifications` row by token hash; mark `used = true`; set `email_verified = true` on user
    - _Requirements: 1.1_

  - [ ] 2.4 Implement login API route (`POST /api/auth/login`)
    - Authenticate with Supabase Auth; issue 24-hour JWT access token and refresh token
    - Enforce failed-attempt counter in Redis (or Supabase KV); lock account after 5 consecutive failures for 15 minutes
    - Return 401 with generic message on bad credentials; 423 with lock duration on locked account
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ]* 2.5 Write property test for login session token expiry and account lockout (fast-check)
    - **Property 4: Successful login always issues a 24-hour session token**
    - **Property 5: Account lockout after 5 consecutive failures**
    - **Validates: Requirements 1.3, 1.5**

  - [ ] 2.6 Implement logout, token refresh, and token invalidation routes
    - `POST /api/auth/logout` — revoke refresh token (insert into `auth:refresh_deny` Redis key)
    - `POST /api/auth/refresh` — rotate access token; reject if refresh token is in deny-list
    - Return 401 for expired/invalid JWTs on any protected resource access
    - _Requirements: 1.6_

  - [ ]* 2.7 Write property test for expired token rejection (fast-check)
    - **Property 6: Expired tokens are always rejected**
    - **Validates: Requirements 1.6**

  - [ ] 2.8 Implement password reset routes (`POST /api/auth/password-reset/request` and `/confirm`)
    - Generate one-time HMAC token; insert into `password_resets`; send reset email
    - On `/confirm`: verify token hash, check expiry, mark all prior unexpired tokens for that user as `used = true`, apply new password
    - _Requirements: 1.7_

  - [ ]* 2.9 Write property test for password reset link invalidation (fast-check)
    - **Property 7: Password reset invalidates all prior links**
    - **Validates: Requirements 1.7**

  - [ ] 2.10 Create authentication middleware (`middleware.ts`) to guard protected routes
    - Verify JWT on every request to protected API routes; attach `userId` and `roles` to request context
    - _Requirements: 1.6_

- [ ] 3. Checkpoint — Auth complete
  - Ensure all auth tests pass. Verify registration, login, lockout, token expiry, and password reset flows end-to-end. Ask the user if questions arise.

- [ ] 4. Tutor profile
  - [ ] 4.1 Implement tutor profile CRUD API routes (`/api/profiles/tutors`)
    - `POST /api/profiles/tutors` — validate display name (2–50 chars), at least one subject, language, skill level; insert `tutor_profiles` row
    - `PUT /api/profiles/tutors/:id` — update fields; invalidate `profile:tutor:{tutorId}` Redis cache key
    - `GET /api/profiles/tutors/:id` — return public profile; cache 300 s in Redis
    - `DELETE /api/profiles/tutors/:id/deactivate` — set `deactivated_at`; hide profile within 60 s
    - Enforce ≤10 subjects at app layer; return 422 with field list on validation failure
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.9_

  - [ ]* 4.2 Write property test for tutor profile validation (fast-check)
    - **Property 8: Tutor profile validation rejects invalid inputs and accepts valid ones**
    - **Property 9: Tutor profile subjects are always bounded at 10**
    - **Validates: Requirements 2.1, 2.3, 2.6, 2.7**

  - [ ] 4.3 Implement profile photo upload route (`POST /api/profiles/tutors/:id/photo`)
    - Accept multipart upload; reject files > 5 MB (413) and unsupported MIME types (415)
    - Stream accepted files to Supabase Storage; persist `photo_url` on `tutor_profiles`
    - _Requirements: 2.4, 2.5_

  - [ ]* 4.4 Write unit tests for photo upload size and format validation
    - Test 5 MB boundary (exactly 5 MB accepted, 5 MB + 1 byte rejected)
    - Test each supported MIME type (JPEG, PNG, WebP) and one unsupported type
    - _Requirements: 2.4, 2.5_

  - [ ] 4.5 Implement profile visibility toggle and private-profile exclusion guard
    - Add `visibility` field to profile update route; create shared `isVisible(profile)` helper used by Search and Recommendation services
    - _Requirements: 2.8_

  - [ ]* 4.6 Write property test for private profile exclusion (fast-check)
    - **Property 10: Private profiles never appear in search or recommendations**
    - **Validates: Requirements 2.8, 4.3, 8.4**

- [ ] 5. Learner preferences
  - [ ] 5.1 Implement learner preferences API routes (`/api/profiles/learners/:id/preferences`)
    - `PUT` — validate languages (Tamil/English/both), subjects (1–10), skill level per subject; upsert `learner_preferences` + `learner_subjects`
    - `GET` — return current preferences
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7_

  - [ ]* 5.2 Write property test for learner subject preference bounds (fast-check)
    - **Property 11: Learner subject preferences are within the 1–10 bound**
    - **Property 12: Learner language preferences are stored and retrieved without transformation**
    - **Validates: Requirements 3.1, 3.2, 3.6, 3.7**

- [ ] 6. Checkpoint — Profiles complete
  - Ensure all profile and preference tests pass. Verify tutor and learner profile flows including visibility, photo upload, and preference persistence. Ask the user if questions arise.

- [ ] 7. Tutor search
  - [ ] 7.1 Set up Elasticsearch index `tutors_v1` with ICU plugin for Tamil support
    - Create index mapping with `standard` + `icu_analyzer` on `display_name`, `bio`, `subject`; keyword fields for `language`, `skill_level`, `visibility`; float field for `average_rating`
    - Implement `lib/search/indexer.ts` to sync tutor profiles to Elasticsearch on create/update/deactivate
    - _Requirements: 4.1, 4.6_

  - [ ] 7.2 Implement search API route (`GET /api/search/tutors`)
    - Accept `subject`, `language`, `skill_level` query params; validate each (subject ≤100 chars, language and skill_level in allowed lists); return 400 identifying each invalid param
    - Build BM25 query with `constant_score` boost for exact subject match; secondary sort by `average_rating`; filter out `visibility: Private`
    - Return empty result set with broadening suggestion when no matches found
    - Enforce 2-second timeout; return 503 on timeout with no partial results
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 7.3 Write property test for search filter correctness (fast-check)
    - **Property 13: Search results always satisfy all active filter criteria**
    - **Property 14: Exact subject matches rank above partial matches**
    - **Property 15: Search rejects invalid query parameters with specific errors**
    - **Validates: Requirements 4.1, 4.3, 4.4, 4.5, 4.7**

  - [ ]* 7.4 Write unit tests for Tamil query pass-through (no transliteration)
    - Submit queries in Tamil Unicode; assert results are returned without client-side transformation
    - _Requirements: 4.6, 9.4_

- [ ] 8. Follow / unfollow
  - [ ] 8.1 Implement follow and unfollow API routes (`/api/profiles/tutors/:id/follow`)
    - `POST` — upsert `follows` row; silently ignore duplicate (idempotent); update cached follower count
    - `DELETE` — delete `follows` row; update cached follower count
    - `GET /api/profiles/tutors/:id/followers` — paginated list of follower profiles
    - Publish `follow.created` / `follow.removed` Kafka events (or equivalent Supabase Realtime broadcast) after successful DB write
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.8_

  - [ ]* 8.2 Write property test for follow idempotency and round-trip feed membership (fast-check)
    - **Property 16: Follow is idempotent on follower count**
    - **Property 17: Follow/unfollow round-trip restores original feed membership**
    - **Validates: Requirements 5.1, 5.3, 5.8**

- [ ] 9. Educational content publishing
  - [ ] 9.1 Implement content creation and editing API routes (`/api/content/posts`, `/api/content/videos`)
    - `POST /api/content/posts` — validate title (1–150), body (1–2000), optional image (≤10 MB, JPEG/PNG/WebP), subject tag, language tag, skill level tag
    - `POST /api/content/videos` — validate YouTube URL against pattern `(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}`; call oEmbed to confirm embeddability
    - `PUT /api/content/posts/:id` and `PUT /api/content/videos/:id` — reject edit if `status = Under_Review` (409)
    - `DELETE /api/content/:id` — set `status = Deleted`; broadcast `content.deleted` event; removal from feeds within 30 s
    - Store content with `status = Draft` or `status = Scheduled` per `publish_at`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8, 6.9_

  - [ ]* 9.2 Write property test for content submission validation (fast-check)
    - **Property 18: Content submission validation identifies every invalid field**
    - **Property 19: YouTube URL validation rejects all non-conforming URLs**
    - **Property 20: Content edit is gated on status — Under_Review blocks edits**
    - **Validates: Requirements 6.1, 6.3, 6.5, 6.8**

  - [ ] 9.3 Implement scheduled publishing cron worker (`/api/cron/publish-scheduled`)
    - Query `content_items` where `status = Scheduled` and `publish_at <= NOW()`; set `status = Published`; emit `content.published` event
    - On failure, retain `Scheduled` status and dispatch error notification to tutor via Notification Service
    - _Requirements: 6.10, 6.11_

  - [ ]* 9.4 Write unit test for scheduled publish cron with mocked time
    - Verify content transitions from `Scheduled` → `Published` exactly when `publish_at` is reached
    - Verify failure path retains `Scheduled` status
    - _Requirements: 6.10, 6.11_

  - [ ] 9.5 Implement content moderation pipeline
    - Create internal handler triggered by `content.published` event
    - Call OpenAI Moderation API for text; call image moderation API for image attachments (if present)
    - If score ≥ threshold: set `status = Under_Review`; hide content from learner views within 30 s; emit `content.flagged` event
    - Expose moderation dashboard route (`/api/admin/moderation`) for human reviewer to `APPROVE` or `REMOVE` flagged items
    - _Requirements: 6.6, 6.7_

  - [ ]* 9.6 Write unit tests for content moderation pipeline
    - Test score-below-threshold → `Approved` path
    - Test score-above-threshold → `Under_Review` + hidden within 30 s path
    - _Requirements: 6.6, 6.7_

- [ ] 10. Checkpoint — Content publishing complete
  - Ensure all content, moderation, and scheduling tests pass. Verify post/video creation, YouTube validation, Under_Review gating, scheduled publish, and moderation flows. Ask the user if questions arise.

- [ ] 11. Personalized feed
  - [ ] 11.1 Implement feed assembly logic and API route (`GET /api/feed`)
    - Fetch followed-tutor content IDs; fetch recommendation snapshot from Redis
    - Compute score: `score = recency_weight × normalized_timestamp + relevance_weight × rec_score`
    - Apply language filter (learner preferred languages); boost items matching learner's skill level per subject
    - Paginate; cache page 1 in Redis for 60 s
    - Fall back to global trending (top 20 by engagement over 7 days) when follows + preferences yield < 5 items
    - Degrade gracefully when Recommendation Engine times out (> 5 s): return followed-tutor content only, no error state
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.8_

  - [ ]* 11.2 Write property test for feed assembly invariants (fast-check)
    - **Property 21: Feed excludes content in non-preferred languages**
    - **Property 22: Feed ranks skill-level-matching items above equal-scored non-matching items**
    - **Property 23: Feed for learner with follows and preferences contains items from both sources**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ] 11.3 Implement feed item removal on content deletion
    - Subscribe to `content.deleted` event; delete matching `feed_items` rows and invalidate feed caches within 30 s
    - _Requirements: 7.6_

  - [ ]* 11.4 Write unit tests for feed fallback and removal logic
    - Verify trending fallback kicks in when result count < 5
    - Verify deleted content is absent from feed within 30 s
    - _Requirements: 7.5, 7.6, 7.8_

- [ ] 12. AI-powered tutor recommendations
  - [ ] 12.1 Implement recommendation engine (`/api/recommendations/tutors/:learnerId`)
    - `GET` — return cached recommendation list; if stale, mark as stale and return immediately
    - `POST .../refresh` — trigger async re-computation: embed learner subjects + languages via multilingual sentence-transformer; compute cosine similarity against tutor vectors; blend with collaborative score (0.6 content-based + 0.4 collaborative + recency bonus)
    - Apply filters: exclude private profiles, exclude already-followed tutors, require ≥1 matching subject or language
    - Return up to 10 tutors; return all eligible if < 10; return empty list with update-preferences prompt if 0 eligible
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ]* 12.2 Write property test for recommendation invariants (fast-check)
    - **Property 24: All tutor recommendations match at least one learner subject or language**
    - **Property 25: Followed tutors are always excluded from recommendations**
    - **Validates: Requirements 8.1, 8.3, 8.5, 8.6**

  - [ ] 12.3 Trigger recommendation refresh on preference and follow/unfollow events
    - Subscribe to `preferences.updated` and `follow.created` / `follow.removed` events; call refresh endpoint; update Redis snapshot within 10 s
    - _Requirements: 8.2, 8.3, 3.4_

  - [ ]* 12.4 Write unit tests for recommendation staleness handling and empty-list case
    - Verify stale list is returned (not an error) when engine times out
    - Verify empty list + prompt when no eligible tutors
    - _Requirements: 8.7, 8.8_

- [ ] 13. Checkpoint — Feed and recommendations complete
  - Ensure all feed assembly and recommendation tests pass. Verify language filtering, skill-level ranking, fallback logic, and recommendation exclusions. Ask the user if questions arise.

- [ ] 14. Bilingual support (Tamil and English)
  - [ ] 14.1 Implement i18n setup with `next-intl` and Tamil/English message files
    - Add `messages/en.json` and `messages/ta.json` for all UI labels, navigation elements, error messages, and instructional text
    - Configure `next-intl` middleware to detect and persist locale from user preference
    - Ensure language switch applies to UI within 2 s (client-side re-render)
    - _Requirements: 9.1, 9.2_

  - [ ] 14.2 Implement display language preference persistence
    - Store selected display language (`display_lang`) in `learner_preferences`; restore on login without re-selection
    - _Requirements: 9.7_

  - [ ]* 14.3 Write property test for Tamil Unicode round-trip integrity (fast-check)
    - **Property 26: Tamil Unicode round-trip integrity**
    - **Property 27: Display language preference persists across sessions**
    - **Validates: Requirements 9.5, 9.7**

  - [ ]* 14.4 Write unit tests for Tamil content rendering
    - Verify Tamil text in bio, post body, and comment body is stored and retrieved byte-for-byte identical
    - _Requirements: 9.5_

- [ ] 15. Content discovery and browsing
  - [ ] 15.1 Implement browse API routes (`/api/browse`)
    - `GET /api/browse/subjects` — return all subject categories with content counts
    - `GET /api/browse/subjects/:subject` — return top 50 items in subject, ranked by `average_rating DESC`, then `published_at DESC`; accept `language`, `skill_level`, `type` filter params (one value each, combinable)
    - Return empty-result message when filters match no content
    - Update displayed results within 1 s of filter application (implement via client-side filter state + fast API response)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 15.2 Write property test for browse result filter satisfaction and sort order (fast-check)
    - **Property 28: Browse results satisfy all applied filter combinations**
    - **Property 29: Browse subject category results are sorted by rating then recency**
    - **Validates: Requirements 10.2, 10.3**

  - [ ] 15.3 Implement saved items API routes (`/api/saved`)
    - `POST /api/saved` — insert `saved_items` row; reject if learner already has 500 saved items (422 with full-collection message)
    - `GET /api/saved` — return saved items sorted by `saved_at DESC`
    - `DELETE /api/saved/:id` — remove saved item
    - _Requirements: 10.6, 10.7, 10.8_

  - [ ]* 15.4 Write property test for saved items collection invariants (fast-check)
    - **Property 30: Saved Items collection never exceeds 500 items**
    - **Property 31: Saved Items are always sorted by save date descending**
    - **Validates: Requirements 10.6, 10.8**

- [ ] 16. Tutor community building
  - [ ] 16.1 Implement community page API route (`/api/community/:tutorId`)
    - Return tutor's posts and video lessons, total follower count, 20 most recent followers sorted by `created_at DESC`
    - _Requirements: 11.1_

  - [ ] 16.2 Implement engagement metrics endpoint with 30-day rolling window
    - `GET /api/community/:tutorId/metrics` — aggregate `view_count`, `save_count`, and net follower growth for events within `NOW() - INTERVAL '30 days'`
    - _Requirements: 11.2_

  - [ ]* 16.3 Write property test for engagement metrics rolling window (fast-check)
    - **Property 32: Engagement metrics are bounded to the 30-day rolling window**
    - **Validates: Requirements 11.2**

  - [ ] 16.4 Implement comments API routes (`/api/content/:id/comments`)
    - `POST` — validate body (1–1000 chars); reject if not authenticated (401); insert `comments` row; emit `comment.created` event; increment comment count
    - `DELETE /api/content/:id/comments/:commentId` — tutor-only; soft-delete via `deleted_at`; confirm to tutor within 10 s
    - _Requirements: 11.3, 11.4, 11.5, 11.7, 11.8_

  - [ ]* 16.5 Write property test for comment length validation (fast-check)
    - **Property 33: Comment length validation rejects out-of-range lengths**
    - **Validates: Requirements 11.4, 11.5**

  - [ ]* 16.6 Write unit tests for comment authentication guard and save count increment
    - Verify unauthenticated comment POST returns 401
    - Verify `save_count` increments within 10 s of save action
    - _Requirements: 11.3, 11.8_

- [ ] 17. Checkpoint — Community complete
  - Ensure all community, comments, and engagement metric tests pass. Verify follower list, 30-day metrics window, comment CRUD, and auth guards. Ask the user if questions arise.

- [ ] 18. Notifications
  - [ ] 18.1 Implement notification fan-out handler
    - Subscribe to `content.published`, `comment.created`, `follow.created` events
    - Resolve recipient list; apply per-user preference gate (skip if type disabled)
    - Insert notification rows into `notifications` table
    - Push real-time delivery via Supabase Realtime (WebSocket) using Redis Pub/Sub broadcast across instances
    - Retry on delivery failure with exponential back-off; deliver within 120 s of trigger
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.8_

  - [ ]* 18.2 Write property test for notification preference gating (fast-check)
    - **Property 34: Disabled notification types are never delivered**
    - **Validates: Requirements 12.4, 12.5**

  - [ ] 18.3 Implement notification inbox and preferences API routes
    - `GET /api/notifications` — return unread notifications sorted by `created_at DESC`; cap at 100 unread items
    - `PUT /api/notifications/:id/read` — mark as read; update within 5 s
    - `PUT /api/notifications/preferences` — upsert `notification_preferences` row
    - _Requirements: 12.4, 12.6, 12.7_

  - [ ]* 18.4 Write unit tests for notification inbox ordering, cap, and read-status update
    - Verify inbox is sorted by `created_at DESC`
    - Verify cap of 100 unread items
    - Verify read-status update reflected within 5 s
    - _Requirements: 12.6, 12.7_

- [ ] 19. Integration wiring and SLA validation
  - [ ] 19.1 Wire all event producers and consumers end-to-end
    - Confirm `content.published` → content moderation → feed update → notification fan-out chain is fully connected
    - Confirm `follow.created` → follower count update → recommendation refresh chain is fully connected
    - Confirm `preferences.updated` → recommendation refresh chain is fully connected
    - _Requirements: 5.5, 5.6, 6.6, 6.7, 7.1, 8.2, 8.3, 12.1–12.3_

  - [ ]* 19.2 Write timing SLA integration tests
    - Verification email enqueued within 2 min (Req 1.1)
    - Profile changes visible within 5 s (Req 2.2)
    - Deactivated profile hidden within 60 s (Req 2.9)
    - Recommendation refresh after preference update within 10 s (Req 3.4)
    - Search results within 2 s (Req 4.1)
    - Follower count updated within 10 s (Req 5.5)
    - Notification delivered within 60 s (Req 5.6, 12.1–12.3)
    - Content deleted from feeds within 30 s (Req 6.9, 7.6)
    - Scheduled content published within 60 s (Req 6.10)
    - Under_Review content hidden within 30 s (Req 6.7)
    - Feed next page within 2 s (Req 7.4)
    - Recommendation updated within 10 s of follow/unfollow (Req 8.3)
    - UI language switch within 2 s (Req 9.2)
    - Browse results updated within 1 s (Req 10.4)
    - Comment deleted from list within 10 s (Req 11.7)
    - Notification read status updated within 5 s (Req 12.7)
    - Notification retry within 120 s (Req 12.8)

- [ ] 20. Final checkpoint — All tests pass
  - Ensure all unit, property-based, and integration SLA tests pass. Verify the full end-to-end user journeys for learner onboarding, tutor content publishing, and notification delivery. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build
- Each task references specific requirements for traceability
- Property-based tests use `fast-check` with a minimum of 100 iterations per property
- Each property test is tagged with a comment: `// Feature: link2skill-platform, Property N: <title>`
- Checkpoints ensure incremental validation at each major milestone
- Kafka events may be replaced with Supabase Realtime broadcasts for the MVP; the event schema remains the same
- All text storage uses PostgreSQL `UTF8` encoding to guarantee Tamil Unicode round-trip integrity

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["2.5", "2.6"] },
    { "id": 4, "tasks": ["2.7", "2.8"] },
    { "id": 5, "tasks": ["2.9", "2.10"] },
    { "id": 6, "tasks": ["4.1", "5.1"] },
    { "id": 7, "tasks": ["4.2", "4.3", "5.2"] },
    { "id": 8, "tasks": ["4.4", "4.5"] },
    { "id": 9, "tasks": ["4.6", "7.1"] },
    { "id": 10, "tasks": ["7.2", "8.1"] },
    { "id": 11, "tasks": ["7.3", "7.4", "8.2"] },
    { "id": 12, "tasks": ["9.1", "14.1"] },
    { "id": 13, "tasks": ["9.2", "14.2"] },
    { "id": 14, "tasks": ["9.3", "14.3", "14.4"] },
    { "id": 15, "tasks": ["9.4", "9.5"] },
    { "id": 16, "tasks": ["9.6", "11.1"] },
    { "id": 17, "tasks": ["11.2", "11.3"] },
    { "id": 18, "tasks": ["11.4", "12.1"] },
    { "id": 19, "tasks": ["12.2", "12.3"] },
    { "id": 20, "tasks": ["12.4", "15.1"] },
    { "id": 21, "tasks": ["15.2", "15.3"] },
    { "id": 22, "tasks": ["15.4", "16.1", "16.2"] },
    { "id": 23, "tasks": ["16.3", "16.4"] },
    { "id": 24, "tasks": ["16.5", "16.6"] },
    { "id": 25, "tasks": ["18.1"] },
    { "id": 26, "tasks": ["18.2", "18.3"] },
    { "id": 27, "tasks": ["18.4", "19.1"] },
    { "id": 28, "tasks": ["19.2"] }
  ]
}
```
