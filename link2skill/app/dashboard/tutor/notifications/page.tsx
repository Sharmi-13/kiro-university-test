// Feature: link2skill-platform
// Task 18.3: Notifications — inbox with mark-as-read
// Requirements: 12.6, 12.7

import { createClient } from "@/lib/supabase/server";
import NotificationInbox from "@/app/components/tutor/NotificationInbox";

export const metadata = { title: "Notifications — Link2Skill" };

interface NotificationRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, payload, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <p className="mt-1 text-sm text-gray-500">
          {(notifications ?? []).filter((n) => !n.is_read).length} unread
        </p>
      </div>
      <NotificationInbox
        initialNotifications={(notifications ?? []) as NotificationRow[]}
      />
    </div>
  );
}
