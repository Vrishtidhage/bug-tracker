import Link from "next/link";
import { Bot, Bug, CheckCircle2, Database, Lock, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { logoutAction } from "@/app/actions/auth";
import { updateProfileAction } from "@/app/actions/settings";
import { findUserById, getUnreadNotificationCount, listProjectsForUser } from "@/lib/local-db";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const user = findUserById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  const projects = listProjectsForUser(user.id);
  const unreadNotifications = getUnreadNotificationCount(user.id);

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-b border-[#e1e7f0] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 text-sm font-semibold text-[#227245]">
            <Bug size={18} />
            Dashboard
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-[#132238] text-white">
              <UserRound size={22} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-[#101828]">Settings</h1>
              <p className="mt-1 text-sm text-[#667085]">Manage your profile and account security.</p>
            </div>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cad2de] bg-white px-4 text-sm font-semibold text-[#344054] hover:border-[#9eabbc]"
          >
            <LogOut size={18} />
            Logout
          </button>
        </form>
      </header>

      <div className="mx-auto mt-6 grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <section className="glass-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-[#101828]">Profile</h2>
          <p className="mt-1 text-sm text-[#667085]">This name appears in comments, activity, and assignment views.</p>

          {params.error ? (
            <p className="mt-5 rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
              {params.error}
            </p>
          ) : null}

          {params.success ? (
            <p className="mt-5 rounded-md border border-[#b8dfc4] bg-[#eef7f1] px-3 py-2 text-sm font-semibold text-[#227245]">
              {params.success}
            </p>
          ) : null}

          <form action={updateProfileAction} className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Full name
              <input
                name="name"
                type="text"
                defaultValue={user.name}
                className="h-11 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Email
              <input
                type="email"
                value={user.email}
                readOnly
                className="h-11 rounded-md border border-[#e1e7f0] bg-[#f7f8fb] px-3 text-sm text-[#667085] outline-none"
              />
            </label>

            <button
              type="submit"
              className="h-11 w-fit rounded-md bg-[#132238] px-4 text-sm font-semibold text-white hover:bg-[#203653]"
            >
              Save profile
            </button>
          </form>
        </section>

        <aside className="grid gap-6">
          <section className="glass-panel rounded-lg p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#227245]" size={20} />
              <h2 className="text-lg font-semibold text-[#101828]">Account</h2>
            </div>
            <dl className="mt-5 grid gap-4 text-sm">
              {[
                ["Role", user.workspaceRole],
                ["Projects", projects.length.toString()],
                ["Unread notifications", unreadNotifications.toString()],
                ["Authentication", user.passwordHash ? "Password enabled" : "Team member placeholder"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-[#edf0f5] pb-3 last:border-0 last:pb-0">
                  <dt className="text-[#667085]">{label}</dt>
                  <dd className="font-semibold text-[#344054]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="glass-panel rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Lock className="text-[#f79009]" size={20} />
              <h2 className="text-lg font-semibold text-[#101828]">Security</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#667085]">
              Routes and server actions are protected with session checks. Password change can be added after the
              release tracking slice.
            </p>
          </section>

          <section className="glass-panel rounded-lg p-5">
            <h2 className="text-lg font-semibold text-[#101828]">System status</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["Local SQLite mode", Database],
                ["Authentication enabled", ShieldCheck],
                ["Notifications enabled", CheckCircle2],
                ["Assistant enabled", Bot],
              ].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center gap-3 rounded-md bg-[#f7f8fb] p-3">
                  <Icon className="text-[#227245]" size={18} />
                  <span className="text-sm font-semibold text-[#344054]">{label as string}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
