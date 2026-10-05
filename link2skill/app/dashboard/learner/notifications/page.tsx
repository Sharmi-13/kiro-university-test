// Feature: link2skill-platform
// Learner notifications page
// Requirements: 12.6, 12.7

import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Notifications — Link2Skill" };

const DEMO_NOTIFICATIONS = [
  { id: "n1", type: "new_content",  message: 'Priya Sundaram published "Calculus Introduction"',  time: "2 hours ago",  read: false },
  { id: "n2", type: "new_content",  message: 'Arjun Krishnan published "Python OOP Masterclass"', time: "5 hours ago",  read: false },
  { id: "n3", type: "new_follower", message: "Meena Rajan posted a new Tamil lesson",              time: "1 day ago",    read: false },
  { id: "n4", type: "new_content",  message: 'Kavitha Nair published "IELTS Writing Tips"',       time: "2 days ago",   read: true },
  { id: "n5", type: "new_content",  message: 'Ravi Chandran published "Kinematics Part 2"',       time: "3 days ago",   read: true },
  { id: "n6", type: "new_content",  message: 'Arjun Krishnan published "Networking - IP Routing"',time: "5 days ago",   read: true },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  new_content: (
    <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
  new_follower: (
    <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
};

export default async function LearnerNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: realNotifs } = await supabase
    .from("notifications")
    .select("id, type, payload, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const hasRealNotifs = (realNotifs ?? []).length > 0;
  const unread = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <p className="mt-1 text-sm text-gray-500">
          {hasRealNotifs
            ? `${(realNotifs ?? []).filter((n) => !n.is_read).length} unread`
            : `${unread} unread — showing sample notifications for demo`}
        </p>
      </div>

      {!hasRealNotifs && (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {DEMO_NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-4 ${!n.read ? "bg-indigo-50/50" : ""}`}
            >
              <div className="mt-0.5 shrink-0">
                {TYPE_ICONS[n.type] ?? TYPE_ICONS.new_content}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                  {n.message}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{n.time}</p>
              </div>
              {!n.read && (
                <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              )}
            </div>
          ))}
        </div>
      )}

      {hasRealNotifs && (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {(realNotifs ?? []).map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-4 ${!n.is_read ? "bg-indigo-50/50" : ""}`}
            >
              <div className="mt-0.5 shrink-0">
                {TYPE_ICONS[n.type as string] ?? TYPE_ICONS.new_content}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${!n.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                  {String((n.payload as Record<string, unknown>)?.message ?? n.type)}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {new Date(n.created_at as string).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              {!n.is_read && (
                <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              )}
            </div>
          ))}
        </div>
      )}

      {!hasRealNotifs && (
        <p className="text-center text-xs text-gray-400">
          Sample notifications shown for demo. Real notifications will appear as you follow tutors.
        </p>
      )}
    </div>
  );
}
