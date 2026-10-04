"use client";

// Feature: link2skill-platform
// Notification preferences settings form
// Requirements: 12.4, 12.5

import { useState } from "react";

interface NotifPrefs {
  new_content: boolean;
  comment: boolean;
  new_follower: boolean;
  updated_at: string | null;
}

const PREF_LABELS: { key: keyof Omit<NotifPrefs, "updated_at">; label: string; description: string }[] = [
  { key: "new_content",  label: "New content from followed tutors", description: "Get notified when a tutor you follow publishes a new post or video." },
  { key: "comment",      label: "Comments on my content",           description: "Get notified when a learner comments on one of your posts or videos." },
  { key: "new_follower", label: "New followers",                     description: "Get notified when someone starts following you." },
];

function Toggle({ checked, onChange, id, label, description }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          checked ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsForm({ initialPrefs }: { initialPrefs: NotifPrefs }) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/tutor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_content:  prefs.new_content,
          comment:      prefs.comment,
          new_follower: prefs.new_follower,
        }),
      });
      if (!res.ok) {
        const j = await res.json() as { error?: { message: string } };
        setError(j.error?.message ?? "Failed to save settings.");
        return;
      }
      setSaved(true);
    } catch {
      setError("A network error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
        Notification preferences
      </h3>

      {saved && (
        <div role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
          ✓ Settings saved.
        </div>
      )}
      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-2 divide-y divide-gray-100">
        {PREF_LABELS.map(({ key, label, description }) => (
          <Toggle
            key={key}
            id={`pref-${key}`}
            checked={prefs[key]}
            onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
            label={label}
            description={description}
          />
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </div>

      {initialPrefs.updated_at && (
        <p className="mt-3 text-xs text-gray-400">
          Last updated{" "}
          {new Date(initialPrefs.updated_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
