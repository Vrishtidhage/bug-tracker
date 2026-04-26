import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bug,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  FolderPlus,
  KanbanSquare,
  Plus,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { logoutAction } from "@/app/actions/auth";
import { canAccessAdmin } from "@/lib/authz";
import { findUserById, getDashboardSnapshot } from "@/lib/local-db";

const baseNav = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Projects", href: "/projects", icon: ClipboardList },
  { label: "Bugs", href: "/bugs", icon: KanbanSquare },
  { label: "Team", href: "/team", icon: UsersRound },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = findUserById(session.user.id);

  if (session.user.accountType === "admin" || canAccessAdmin(currentUser?.workspaceRole)) {
    redirect("/admin");
  }

  const nav = baseNav;
  const snapshot = getDashboardSnapshot(session.user.id);
  const stats = [
    { ...snapshot.stats[0], icon: Bug, color: "text-[#4e8cff]" },
    { ...snapshot.stats[1], icon: AlertTriangle, color: "text-[#f04438]" },
    { ...snapshot.stats[2], icon: CircleDot, color: "text-[#f79009]" },
    { ...snapshot.stats[3], icon: CheckCircle2, color: "text-[#12b76a]" },
  ];

  return (
    <main className="pro-app min-h-screen text-[#172033]">
      <div className="grid min-h-screen lg:grid-cols-[270px_1fr]">
        <aside className="border-r border-white/20 bg-[#101828]/94 px-5 py-6 text-white shadow-2xl shadow-[#101828]/20 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-white text-[#132238]">
              <Bug size={22} />
            </span>
            <span className="text-lg font-semibold tracking-tight">E-Bug Tracker</span>
          </Link>

          <nav className="mt-10 grid gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="px-5 py-6 sm:px-8">
          <header className="glass-panel flex flex-col gap-4 rounded-lg p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#227245]">Customer Portal</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#101828]">Bug dashboard</h1>
              <p className="mt-1 text-sm text-[#667085]">
                Signed in as {session.user.name ?? session.user.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-11 items-center gap-3 rounded-md border border-[#cad2de] bg-white px-3 md:flex">
                <Search size={18} className="text-[#667085]" />
                <input
                  type="search"
                  placeholder="Search bugs"
                  className="w-52 bg-transparent text-sm outline-none"
                />
              </div>
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative flex size-11 items-center justify-center rounded-md border border-[#cad2de] bg-white text-[#536173] shadow-sm hover:border-[#9eabbc]"
              >
                <Bell size={18} />
                {snapshot.unreadNotifications > 0 ? (
                  <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#f04438] px-1 text-[11px] font-semibold text-white">
                    {snapshot.unreadNotifications}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/projects/new"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-[#cad2de] bg-white px-4 text-sm font-semibold text-[#344054] shadow-sm hover:border-[#9eabbc]"
              >
                <FolderPlus size={18} />
                New project
              </Link>
              <Link
                href="/bugs/new"
                className="premium-button inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold text-white"
              >
                <Plus size={18} />
                New bug
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="h-11 rounded-md border border-[#cad2de] bg-white px-4 text-sm font-semibold text-[#344054] hover:border-[#9eabbc]"
                >
                  Logout
                </button>
              </form>
            </div>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="lift-card rounded-lg border border-[#e1e7f0] bg-white/94 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#667085]">{stat.label}</p>
                    <Icon size={20} className={stat.color} />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-[#101828]">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_330px]">
            <section className="glass-panel rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#101828]">Kanban workflow</h2>
                  <p className="mt-1 text-sm text-[#667085]">
                    Status lanes are ready for drag-and-drop once actions are wired.
                  </p>
                </div>
                <KanbanSquare className="text-[#8a95a7]" size={22} />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-4">
                {snapshot.columns.map((column) => (
                  <div key={column.title} className="rounded-lg border border-white/70 bg-[#f7f8fb]/90 p-3">
                    <p className="text-sm font-semibold text-[#344054]">{column.title}</p>
                    <div className="mt-3 grid gap-3">
                      {column.bugs.map((bug) => (
                        <Link key={bug.id} href={`/bugs/${bug.id}`} className="lift-card rounded-md border border-[#e1e7f0] bg-white p-3">
                          <p className="text-sm font-semibold text-[#172033]">{bug.title}</p>
                          <p className="mt-2 text-xs font-medium text-[#667085]">
                            {bug.bugKey} | {bug.assignee ?? "Unassigned"}
                          </p>
                        </Link>
                      ))}
                      {column.bugs.length === 0 ? (
                        <p className="rounded-md border border-dashed border-[#d7deea] p-3 text-sm text-[#667085]">
                          No bugs
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="grid gap-6">
              <div className="glass-panel rounded-lg p-5">
                <h2 className="text-lg font-semibold text-[#101828]">Recent activity</h2>
                <div className="mt-5 grid gap-4">
                  {snapshot.recentActivity.map((activity) => (
                    <div key={activity.id} className="border-b border-[#edf0f5] pb-4 last:border-0 last:pb-0">
                      <Link href={`/bugs/${activity.bugId}`} className="text-sm font-semibold text-[#172033] hover:text-[#175cd3]">
                        {activity.bugKey}: {activity.title}
                      </Link>
                      <p className="mt-1 text-xs text-[#667085]">
                        {activity.actor} {activity.action.replaceAll("_", " ").toLowerCase()} /{" "}
                        {new Date(activity.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                  {snapshot.recentActivity.length === 0 ? (
                    <p className="text-sm text-[#667085]">No activity yet.</p>
                  ) : null}
                </div>
              </div>

              <div className="glass-panel rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <CalendarClock className="text-[#f79009]" size={22} />
                  <h2 className="text-lg font-semibold text-[#101828]">SLA watch</h2>
                </div>
                <div className="mt-5 grid gap-4">
                  {snapshot.slaWatch.map((bug) => (
                      <div key={bug.id} className="border-b border-[#edf0f5] pb-4 last:border-0 last:pb-0">
                        <Link href={`/bugs/${bug.id}`} className="text-sm font-semibold text-[#172033] hover:text-[#175cd3]">
                          {bug.title}
                        </Link>
                        <p className="mt-1 text-sm text-[#667085]">
                          Due {bug.slaDueAt ? new Date(bug.slaDueAt).toLocaleString("en-IN") : "soon"}
                        </p>
                      </div>
                    ))}
                  {snapshot.slaWatch.length === 0 ? (
                    <p className="text-sm text-[#667085]">No active SLA pressure.</p>
                  ) : null}
                </div>
              </div>

              <div className="glass-panel rounded-lg p-5">
                <h2 className="text-lg font-semibold text-[#101828]">Team workload</h2>
                <div className="mt-5 grid gap-3">
                  {snapshot.workload.map(({ name, count, width }) => (
                    <div key={name}>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-[#344054]">{name}</span>
                        <span className="text-[#667085]">{count} bugs</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[#edf0f5]">
                        <div className="h-2 rounded-full bg-[#4e8cff]" style={{ width }} />
                      </div>
                    </div>
                  ))}
                  {snapshot.workload.length === 0 ? (
                    <p className="text-sm text-[#667085]">No active workload yet.</p>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
