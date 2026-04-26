import Link from "next/link";
import { Bell, Bug, CheckCheck, CircleDot } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications";
import { getUnreadNotificationCount, listNotificationsForUser } from "@/lib/local-db";

const typeLabels: Record<string, string> = {
  BUG_CREATED: "Bug created",
  STATUS_CHANGED: "Status changed",
  COMMENT_ADDED: "Comment added",
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const notifications = listNotificationsForUser(session.user.id);
  const unreadCount = getUnreadNotificationCount(session.user.id);

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-4 border-b border-[#e1e7f0] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 text-sm font-semibold text-[#227245]">
            <Bug size={18} />
            Dashboard
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-[#132238] text-white">
              <Bell size={22} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-[#101828]">Notifications</h1>
              <p className="mt-1 text-sm text-[#667085]">
                Track assignment, comments, status movement, and bug activity.
              </p>
            </div>
          </div>
        </div>

        <form action={markAllNotificationsReadAction}>
          <button
            type="submit"
            disabled={unreadCount === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cad2de] bg-white px-4 text-sm font-semibold text-[#344054] hover:border-[#9eabbc] disabled:cursor-not-allowed disabled:text-[#98a2b3]"
          >
            <CheckCheck size={18} />
            Mark all read
          </button>
        </form>
      </header>

      <section className="glass-panel mx-auto mt-6 w-full max-w-5xl rounded-lg">
        <div className="flex items-center justify-between border-b border-[#edf0f5] p-5">
          <h2 className="text-lg font-semibold text-[#101828]">Inbox</h2>
          <span className="rounded-md bg-[#eef7f1] px-2 py-1 text-xs font-semibold text-[#227245]">
            {unreadCount} unread
          </span>
        </div>

        <div className="divide-y divide-[#edf0f5]">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <span
                  className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-md ${
                    notification.readAt ? "bg-[#f2f5f9] text-[#667085]" : "bg-[#eef7f1] text-[#227245]"
                  }`}
                >
                  {notification.readAt ? <Bell size={17} /> : <CircleDot size={17} />}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#667085]">
                    {typeLabels[notification.type] ?? notification.type}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#101828]">{notification.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#536173]">{notification.body}</p>
                  <p className="mt-2 text-xs text-[#667085]">
                    {new Date(notification.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <form action={markNotificationReadAction}>
                <input type="hidden" name="notificationId" value={notification.id} />
                <input type="hidden" name="href" value={notification.href ?? "/notifications"} />
                <button
                  type="submit"
                  className="h-10 rounded-md border border-[#cad2de] px-4 text-sm font-semibold text-[#344054] hover:border-[#9eabbc]"
                >
                  {notification.href ? "Open" : "Mark read"}
                </button>
              </form>
            </div>
          ))}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-[#344054]">No notifications yet</p>
            <p className="mt-2 text-sm text-[#667085]">
              Create bugs, change statuses, or add comments to generate notifications.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
