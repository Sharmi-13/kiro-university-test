"use client";

// Feature: link2skill-platform
// Task 9.1: Create Content form — Post and Video_Lesson
// Requirements: 6.1, 6.2, 6.3, 6.5

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_LANGUAGES, SUPPORTED_SKILL_LEVELS } from "@/lib/profiles/validation";

const CONTENT_TYPES = [
  { value: "Post",         label: "Post",         description: "A text-based educational post" },
  { value: "Video_Lesson", label: "Video Lesson",  description: "A YouTube video lesson" },
] as const;

interface FieldErrors {
  type?: string;
  title?: string;
  body?: string;
  video_url?: string;
  subject_tag?: string;
  language_tag?: string;
  skill_level?: string;
  root?: string;
}

export default function CreateContentForm() {
  const router = useRouter();

  const [type, setType]         = useState<"Post" | "Video_Lesson">("Post");
  const [title, setTitle]       = useState("");
  const [body, setBody]         = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [subjectTag, setSubjectTag]   = useState("");
  const [languageTag, setLanguageTag] = useState<typeof SUPPORTED_LANGUAGES[number]>("English");
  const [skillLevel, setSkillLevel]   = useState<typeof SUPPORTED_SKILL_LEVELS[number]>("Beginner");

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setServerError(null);

    const body_payload =
      type === "Post"
        ? { type, title, body, subject_tag: subjectTag, language_tag: languageTag, skill_level: skillLevel }
        : { type, title, body: body || undefined, video_url: videoUrl, subject_tag: subjectTag, language_tag: languageTag, skill_level: skillLevel };

    try {
      const res = await fetch("/api/tutor/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body_payload),
      });
      const json = await res.json() as { data?: { id: string }; error?: { message: string; fields?: { field: string; message: string }[] } };

      if (!res.ok) {
        const err = json.error;
        if (err?.fields && err.fields.length > 0) {
          const map: FieldErrors = {};
          err.fields.forEach((f) => { (map as Record<string, string>)[f.field] = f.message; });
          setFieldErrors(map);
        } else {
          setServerError(err?.message ?? "Failed to create content.");
        }
        return;
      }

      // Redirect to My Content on success
      router.push("/dashboard/tutor/content");
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Create content</h2>
        <p className="mt-1 text-sm text-gray-500">
          Content is saved as a Draft. Publish it from My Content when you&apos;re ready.
        </p>
      </div>

      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Content type selector */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700">Content type</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {CONTENT_TYPES.map((ct) => (
              <label
                key={ct.value}
                className={`cursor-pointer rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 ${
                  type === ct.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="type"
                  value={ct.value}
                  checked={type === ct.value}
                  onChange={() => setType(ct.value)}
                />
                <p className={`text-sm font-semibold ${type === ct.value ? "text-indigo-700" : "text-gray-900"}`}>
                  {ct.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{ct.description}</p>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!fieldErrors.title}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
          />
          {fieldErrors.title && <p role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
        </div>

        {/* Body (Post) or YouTube URL (Video) */}
        {type === "Post" ? (
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              Content <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <textarea
              id="body"
              required
              rows={8}
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your educational post here…"
              aria-invalid={!!fieldErrors.body}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{body.length}/2000</p>
            {fieldErrors.body && <p role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.body}</p>}
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700">
                YouTube URL <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="video_url"
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                aria-invalid={!!fieldErrors.video_url}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
              />
              {fieldErrors.video_url && <p role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.video_url}</p>}
            </div>
            <div>
              <label htmlFor="video_desc" className="block text-sm font-medium text-gray-700">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="video_desc"
                rows={4}
                maxLength={2000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe what learners will learn…"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        {/* Subject tag */}
        <div>
          <label htmlFor="subject_tag" className="block text-sm font-medium text-gray-700">
            Subject <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="subject_tag"
            type="text"
            required
            maxLength={100}
            value={subjectTag}
            onChange={(e) => setSubjectTag(e.target.value)}
            placeholder="e.g. Mathematics"
            aria-invalid={!!fieldErrors.subject_tag}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
          />
          {fieldErrors.subject_tag && <p role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.subject_tag}</p>}
        </div>

        {/* Language + skill level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="language_tag" className="block text-sm font-medium text-gray-700">Language</label>
            <select
              id="language_tag"
              value={languageTag}
              onChange={(e) => setLanguageTag(e.target.value as typeof languageTag)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {SUPPORTED_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="skill_level" className="block text-sm font-medium text-gray-700">Skill level</label>
            <select
              id="skill_level"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as typeof skillLevel)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {SUPPORTED_SKILL_LEVELS.map((sl) => <option key={sl} value={sl}>{sl}</option>)}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <a
            href="/dashboard/tutor/content"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
