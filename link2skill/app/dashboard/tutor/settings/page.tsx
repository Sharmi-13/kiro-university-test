// Feature: link2skill-platform
// Task 18.3: Settings — notification preferences
// Requirements: 12.4, 12.5

import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/app/components/tutor/SettingsForm";

export const metadata = { title: "Settings — Link2Skill" };

interface NotifPrefs {
  new_content: boolean;
  comment: boolean;
  new_follower: boolean;
  updated_at: string | null;
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("new_content, comment, new_follower, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const defaults: NotifPrefs = { new_content: true, comment: true, new_follower: true, updated_at: null };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your notification preferences.
        </p>
      </div>
      <SettingsForm initialPrefs={(prefs ?? defaults) as NotifPrefs} />
    </div>
  );
}
