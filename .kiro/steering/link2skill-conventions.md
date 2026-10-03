---
inclusion: auto
name: Link2Skill Project Conventions
description: Project-wide engineering and architecture conventions for Link2Skill — read this before writing any code in this repository.
---

# Link2Skill Project Conventions

## Project Purpose and Architecture

Link2Skill is an AI-powered community learning platform connecting Tamil and English learners with tutors. The stack is:

- **Frontend/Backend**: Next.js (App Router) + TypeScript, deployed on Vercel
- **Database/Auth/Storage**: Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- **Validation**: Zod v4 (`zod@^4.6.5`) — use `z.safeParse()`, never `.parse()`
- **Testing**: Vitest + fast-check (property-based)
- **Environment**: `@t3-oss/env-nextjs` for type-safe env vars

All implementation is spec-driven. The canonical specs live in:
- `.kiro/specs/link2skill-platform/requirements.md` — 12 requirements, the source of truth
- `.kiro/specs/link2skill-platform/design.md` — data models, API contracts, correctness properties
- `.kiro/specs/link2skill-platform/tasks.md` — incremental implementation tasks with requirement traceability

**Never invent requirements or add features not present in the specs.**

---

## Next.js + TypeScript + App Router Conventions

- This is **Next.js 16** (App Router). APIs, file conventions, and server/client semantics may differ from your training data. Check `node_modules/next/dist/docs/` before writing code.
- All routes live under `app/` using the App Router file convention (`page.tsx`, `layout.tsx`, `route.ts`).
- API routes are `app/api/<path>/route.ts` and export named HTTP verb handlers (`GET`, `POST`, `PUT`, `DELETE`).
- Prefer **server components** by default. Mark client components with `"use client"` only when interactivity requires it.
- Path alias `@/` maps to the project root (`link2skill/`). Use it for all internal imports — never use relative `../../` paths that cross directory boundaries.
- TypeScript strict mode is on. No `any`. Use `unknown` and narrow with Zod or type guards.
- All enums are in `lib/types/index.ts` (`UserRole`, `ContentType`, `ContentStatus`, `SkillLevel`, `NotificationType`). Import from there; do not redefine.

---

## Supabase / Auth / Database Conventions

- **Two Supabase clients** — use the right one:
  - `lib/supabase/client.ts` — browser client (for client components)
  - `lib/supabase/server.ts` — server client (for API routes and server components); requires `await createClient()`
- Authentication is handled entirely by **Supabase Auth**. Do not manage passwords, sessions, or tokens manually.
- `public.users` is populated by the `handle_new_user` AFTER INSERT trigger on `auth.users` (migration `20261001043126`). **Never insert directly into `public.users` from application code.**
- The trigger uses `SECURITY DEFINER` to bypass RLS. Do not remove or modify this pattern.
- All text columns use PostgreSQL `UTF8` encoding to guarantee Tamil Unicode round-trip integrity. Do not add `ENCODING` overrides.
- Row Level Security (RLS) is the default posture. New tables must have RLS enabled and explicit policies.
- Migration files go in `supabase/migrations/` with timestamp-prefixed filenames. Never modify an already-applied migration — add a new one.

---

## API Response / Error Envelope Conventions

Every API route must use the shared helpers in `lib/api/response.ts`:

```typescript
// Success — always { data: T }
return success(payload, 201);

// Error — always { error: { code, message, fields?: [...] } }
return error("validation_failed", "One or more fields are invalid", 422, zodFieldErrors(err));
```

- `success<T>(data, status?)` — wraps in `{ data }`, defaults to HTTP 200
- `error(code, message, status, fields?)` — wraps in `{ error: { code, message, fields? } }`; omits `fields` key when array is empty
- HTTP status conventions: `200` success, `201` created, `400` bad JSON, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `422` validation failure, `500` internal error
- Never expose internal error details, stack traces, or Supabase error internals in responses.
- Duplicate email → HTTP 409, generic message only (Requirement 1.2). Never disclose which field caused the conflict for auth errors.

---

## Validation Conventions

- All input validation uses **Zod v4**. Define schemas in `lib/<domain>/validation.ts`, separate from the route handler, so tests can import them without pulling in Next.js server modules.
- Export individual field schemas (e.g. `emailSchema`, `usernameSchema`) alongside the full payload schema — property tests need them.
- Map Zod errors to `FieldError[]` using the `zodFieldErrors(err: z.ZodError)` helper pattern (see `app/api/auth/register/route.ts`).
- Use `z.string().min().max().regex()` chains; prefer `.refine()` for multi-condition rules (e.g. password complexity).
- Username: 3–50 chars, `[A-Za-z0-9_-]` only (Requirement 1.9).
- Password: ≥8 chars, at least one uppercase, one lowercase, one digit (Requirement 1.1).
- Comment body: 1–1000 chars (`lib/validation/comment.ts`).

---

## Testing Conventions — Vitest + fast-check

- Test files: `lib/**/*.test.ts` and `app/**/*.test.ts` (picked up by `vitest.config.ts`).
- File naming: `<subject>.property.test.ts` for property-based tests, `<subject>.test.ts` for unit tests.
- All property tests live in `lib/__tests__/`.
- Every property test file must include a header comment:
  ```
  // Feature: link2skill-platform, Property N: <title>
  ```
- Minimum **100 iterations** per property: `fc.assert(fc.property(...), { numRuns: 100 })`.
- Tests must not import Next.js server modules (`cookies`, `headers`, `next/server`). Extract pure logic into `lib/` for testability.
- Run tests with: `npm run test` (single run) or `npm run test:watch` (watch mode).
- Do not write tests that require a live Supabase connection — mock the client or test pure logic only. Integration tests against Supabase are deferred to a separate test Supabase instance.
- Tasks marked `*` in `tasks.md` are optional property tests. Non-starred tests are mandatory.

---

## Tamil / English Bilingual Content Handling

- Tamil Unicode block: `U+0B80`–`U+0BFF`. **Never alter, normalize, or truncate Tamil text** at any layer.
- Database encoding is `UTF8` — no additional encoding work needed at the app layer.
- All content items (`posts`, `video_lessons`) require exactly one `language_tag`: `"Tamil"` or `"English"`.
- Search queries in Tamil script must be passed through as-is — no client-side transliteration (Requirement 4.6).
- UI i18n uses `next-intl` with message files `messages/en.json` and `messages/ta.json` (Task 14.1 — not yet implemented).
- Tamil string operations must be code-point-aware. Use `[...str]` or `str.codePointAt()` for length/iteration, not `.length` (which counts UTF-16 code units).
- Property 26 in the design document defines the Tamil Unicode round-trip integrity guarantee — see `lib/__tests__/tamil-unicode.property.test.ts`.

---

## Security and Secret-Handling Rules

- **Never hardcode secrets, API keys, tokens, or passwords** in any source file. All secrets go in environment variables.
- Environment variables are validated at startup via `@t3-oss/env-nextjs` (`lib/env/`). Add new env vars to the schema there — do not use `process.env` directly.
- Never read, log, or echo `.env*` files, `*.pem`, `*.key`, or any credentials file. If a file path looks like it contains secrets, skip it.
- Supabase service role key must never appear in client-side code. The browser client uses the anon key only.
- The `handle_new_user` trigger uses `SECURITY DEFINER` — do not expand its scope or grant it additional privileges.
- SQL queries must use parameterized inputs. Never concatenate user input into a query string.
- Password reset tokens and email verification tokens are stored as HMAC hashes (`token_hash`), never as plaintext.

---

## Naming and Code Organization

```
link2skill/
  app/
    api/<domain>/<action>/route.ts   # API routes
    <page>/page.tsx                   # Page components
  lib/
    api/response.ts                   # Shared response helpers
    auth/validation.ts                # Auth Zod schemas
    supabase/client.ts                # Browser Supabase client
    supabase/server.ts                # Server Supabase client
    types/index.ts                    # All shared enums and types
    validation/<domain>.ts            # Domain-specific Zod schemas
    __tests__/                        # All test files
  supabase/
    migrations/                       # Timestamped SQL migration files
```

- File names: `kebab-case.ts`
- React components: `PascalCase.tsx`
- Variables and functions: `camelCase`
- Database columns and tables: `snake_case`
- Zod schema variables: suffix with `Schema` (e.g. `registerSchema`, `commentBodySchema`)
- Exported constants: `UPPER_SNAKE_CASE` (e.g. `COMMENT_MAX_LENGTH`)
- Every source file that implements a spec task should begin with a comment block:
  ```typescript
  // Feature: link2skill-platform
  // Task 2.1: POST /api/auth/register
  // Requirements: 1.1, 1.2, 1.8, 1.9
  ```

---

## Spec-Driven Development Workflow

This project uses Kiro's spec-driven workflow. **Always preserve this workflow:**

1. Requirements, design decisions, and implementation tasks are authoritative in `.kiro/specs/link2skill-platform/`.
2. Before implementing any feature, read the relevant requirement and design section.
3. After implementing, verify the implementation against the acceptance criteria in `requirements.md`.
4. Task completion status is tracked in `tasks.md`. Mark tasks complete only when the implementation is working and tests pass.
5. Do not add features, tables, API routes, or types that are not traceable to a requirement.
6. The correctness properties in `design.md` define what the property-based tests must verify. Every property test must reference its property number.
7. Checkpoints (Tasks 3, 6, 10, 13, 17, 20) are review gates — run the full test suite before declaring a checkpoint complete.
