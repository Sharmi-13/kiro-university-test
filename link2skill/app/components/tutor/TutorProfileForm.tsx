"use client";

// Feature: link2skill-platform
// Task 4.1: Tutor Profile create/edit form — client component
// Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8

import { useState } from "react";
import { SUPPORTED_LANGUAGES, SUPPORTED_SKILL_LEVELS, SUPPORTED_VISIBILITIES } from "@/lib/profiles/validation";

interface TutorProfileData {
  id: string;
  display_name: string;
  biography: string | null;
  photo_url: string | null;
  subjects: string[];
  languages: string[];
  skill_levels: string[];
  visibility: "public" | "private";
  average_rating: number;
  follower_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  userId: string;
  existingProfile: TutorProfileData | null;
}

interface FieldErrors {
  display_name?: string;
  biography?: string;
  subjects?: string;
  languages?: string;
  skill_levels?: string;
  root?: string;
}

// ── Tag input ────────────────────────────────────────────────────────────

function TagInput({
  id,
  label,
  values,
  onChange,
  placeholder,
  hint,
  error,
  maxItems,
}: {
  id: string;
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  maxItems?: number;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) { setDraft(""); return; }
    if (maxItems && values.length >= maxItems) return;
    onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          disabled={!!(maxItems && values.length >= maxItems)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || !!(maxItems && values.length >= maxItems)}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-100 pl-2.5 pr-1 py-0.5 text-xs font-medium text-indigo-700"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                aria-label={`Remove ${v}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-indigo-500 hover:bg-indigo-200 hover:text-indigo-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Toggle checkbox ───────────────────────────────────────────────────────

function MultiToggle<T extends string>({
  label,
  options,
  values,
  onChange,
  error,
}: {
  label: string;
  options: readonly T[];
  values: T[];
  onChange: (v: T[]) => void;
  error?: string;
}) {
  function toggle(opt: T) {
    if (values.includes(opt)) {
      if (values.length === 1) return; // keep at least one
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  }
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-gray-700">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 ${
              values.includes(opt)
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={values.includes(opt)}
              onChange={() => toggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </fieldset>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────

export default function TutorProfileForm({ userId, existingProfile }: Props) {
  const isNew = !existingProfile;

  const [displayName, setDisplayName] = useState(existingProfile?.display_name ?? "");
  const [biography, setBiography]     = useState(existingProfile?.biography ?? "");
  const [subjects, setSubjects]       = useState<string[]>(existingProfile?.subjects ?? []);
  const [languages, setLanguages]     = useState<typeof SUPPORTED_LANGUAGES[number][]>(
    (existingProfile?.languages ?? []) as typeof SUPPORTED_LANGUAGES[number][],
  );
  const [skillLevels, setSkillLevels] = useState<typeof SUPPORTED_SKILL_LEVELS[number][]>(
    (existingProfile?.skill_levels ?? []) as typeof SUPPORTED_SKILL_LEVELS[number][],
  );
  const [visibility, setVisibility] = useState<typeof SUPPORTED_VISIBILITIES[number]>(
    existingProfile?.visibility ?? "public",
  );

  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setFieldErrors({});
    setServerError(null);

    const body = { display_name: displayName, biography: biography || undefined, subjects, languages, skill_levels: skillLevels, visibility };
    const url  = isNew ? "/api/profiles/tutors" : `/api/profiles/tutors/${userId}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { data?: unknown; error?: { message: string; fields?: { field: string; message: string }[] } };

      if (!res.ok) {
        const err = json.error;
        if (err?.fields && err.fields.length > 0) {
          const map: FieldErrors = {};
          err.fields.forEach((f) => {
            (map as Record<string, string>)[f.field] = f.message;
          });
          setFieldErrors(map);
        } else {
          setServerError(err?.message ?? "Failed to save profile.");
        }
        return;
      }
      setSaved(true);
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {isNew ? "Create your tutor profile" : "Edit tutor profile"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isNew
            ? "Set up your profile so learners can discover you."
            : "Keep your profile up to date for the best discoverability."}
        </p>
      </div>

      {/* Stats bar (existing profiles only) */}
      {!isNew && existingProfile && (
        <div className="flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Followers</p>
            <p className="mt-0.5 text-lg font-bold text-purple-600">{existingProfile.follower_count}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Rating</p>
            <p className="mt-0.5 text-lg font-bold text-indigo-600">
              {existingProfile.average_rating > 0 ? existingProfile.average_rating.toFixed(1) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Profile status</p>
            <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${visibility === "public" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
              {visibility === "public" ? "Public" : "Private"}
            </span>
          </div>
        </div>
      )}

      {/* Success banner */}
      {saved && (
        <div role="status" className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
          ✓ Profile saved successfully.
        </div>
      )}

      {/* Server error */}
      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Display name */}
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
            Display name <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="display_name"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            aria-describedby={fieldErrors.display_name ? "dn-error" : undefined}
            aria-invalid={!!fieldErrors.display_name}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
          />
          {fieldErrors.display_name && (
            <p id="dn-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.display_name}</p>
          )}
        </div>

        {/* Biography */}
        <div>
          <label htmlFor="biography" className="block text-sm font-medium text-gray-700">
            Biography
          </label>
          <p className="mt-0.5 text-xs text-gray-500">Tell learners about your expertise. Max 500 characters.</p>
          <textarea
            id="biography"
            rows={4}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            maxLength={500}
            aria-describedby={fieldErrors.biography ? "bio-error" : "bio-hint"}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p id="bio-hint" className="mt-1 text-xs text-gray-400 text-right">
            {biography.length}/500
          </p>
          {fieldErrors.biography && (
            <p id="bio-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.biography}</p>
          )}
        </div>

        {/* Subjects */}
        <TagInput
          id="subjects"
          label="Subjects"
          values={subjects}
          onChange={setSubjects}
          placeholder="e.g. Mathematics"
          hint="Add up to 10 subjects. Press Enter or click Add."
          error={fieldErrors.subjects}
          maxItems={10}
        />

        {/* Languages */}
        <MultiToggle
          label="Teaching languages"
          options={SUPPORTED_LANGUAGES}
          values={languages}
          onChange={(v) => setLanguages(v as typeof languages)}
          error={fieldErrors.languages}
        />

        {/* Skill levels */}
        <MultiToggle
          label="Skill levels taught"
          options={SUPPORTED_SKILL_LEVELS}
          values={skillLevels}
          onChange={(v) => setSkillLevels(v as typeof skillLevels)}
          error={fieldErrors.skill_levels}
        />

        {/* Visibility */}
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
            Profile visibility
          </label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
            className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {SUPPORTED_VISIBILITIES.map((v) => (
              <option key={v} value={v}>
                {v === "public" ? "Public — discoverable by learners" : "Private — only you can see this"}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : isNew ? "Create profile" : "Save changes"}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                setDisplayName(existingProfile!.display_name);
                setBiography(existingProfile!.biography ?? "");
                setSubjects(existingProfile!.subjects);
                setLanguages(existingProfile!.languages as typeof languages);
                setSkillLevels(existingProfile!.skill_levels as typeof skillLevels);
                setVisibility(existingProfile!.visibility);
                setSaved(false);
                setFieldErrors({});
                setServerError(null);
              }}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
