import Link from "next/link";
import { BarChart3, Bug, CalendarDays, Download, FolderKanban, Gauge, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { canViewReports } from "@/lib/authz";
import { findUserById, getReportSnapshot } from "@/lib/local-db";

const statusLabel: Record<string, string> = {
  OPEN: "Open",
  TRIAGED: "Triaged",
  IN_PROGRESS: "In Progress",
  QA_VERIFY: "QA Verify",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REOPENED: "Reopened",
};

const priorityLabel: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const totalCards: Array<{
  label: string;
  key: keyof ReturnType<typeof getReportSnapshot>["totals"];
  icon: LucideIcon;
  color: string;
}> = [
  { label: "Projects", key: "projects", icon: FolderKanban, color: "text-[#4e8cff]" },
  { label: "Total bugs", key: "bugs", icon: Bug, color: "text-[#175cd3]" },
  { label: "Open", key: "open", icon: BarChart3, color: "text-[#f79009]" },
  { label: "Closed", key: "closed", icon: Gauge, color: "text-[#12b76a]" },
  { label: "Critical", key: "critical", icon: ShieldAlert, color: "text-[#f04438]" },
  { label: "Overdue", key: "overdue", icon: CalendarDays, color: "text-[#b42318]" },
];

function formatLabel(value: string, dictionary: Record<string, string>) {
  return dictionary[value] ?? value.replaceAll("_", " ");
}

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = findUserById(session.user.id);

  if (!canViewReports(currentUser?.workspaceRole ?? session.user.role)) {
    redirect("/dashboard");
  }

  const report = getReportSnapshot(session.user.id);
  const closureRate =
    report.totals.bugs > 0 ? Math.round((report.totals.closed / report.totals.bugs) * 100) : 0;

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 border-b border-[#e1e7f0] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 text-sm font-semibold text-[#227245]">
            <Bug size={18} />
            Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-[#101828]">Reports</h1>
          <p className="mt-2 text-sm text-[#667085]">
            Track project health, bug priority, closure progress, and high-risk modules.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cad2de] bg-white px-4 text-sm font-semibold text-[#344054]"
        >
          <Download size={18} />
          Report ready
        </button>
      </header>

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-4 md:grid-cols-3 xl:grid-cols-6">
        {totalCards.map(({ label, key, icon: Icon, color }) => (
          <div key={label} className="lift-card rounded-lg border border-[#e1e7f0] bg-white/92 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#667085]">{label}</p>
              <Icon size={20} className={color} />
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#101828]">{report.totals[key]}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-6 xl:grid-cols-2">
        <article className="glass-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-[#101828]">Status distribution</h2>
          <div className="mt-5 grid gap-4">
            {report.statusRows.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[#344054]">{formatLabel(row.label, statusLabel)}</span>
                  <span className="text-[#667085]">{row.count}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#edf0f5]">
                  <div className="h-2 rounded-full bg-[#4e8cff]" style={{ width: row.width }} />
                </div>
              </div>
            ))}
            {report.statusRows.length === 0 ? (
              <p className="text-sm text-[#667085]">No bug status data yet.</p>
            ) : null}
          </div>
        </article>

        <article className="glass-panel rounded-lg p-5">
          <h2 className="text-lg font-semibold text-[#101828]">Priority distribution</h2>
          <div className="mt-5 grid gap-4">
            {report.priorityRows.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[#344054]">{formatLabel(row.label, priorityLabel)}</span>
                  <span className="text-[#667085]">{row.count}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#edf0f5]">
                  <div className="h-2 rounded-full bg-[#12b76a]" style={{ width: row.width }} />
                </div>
              </div>
            ))}
            {report.priorityRows.length === 0 ? (
              <p className="text-sm text-[#667085]">No priority data yet.</p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
        <article className="glass-panel rounded-lg">
          <div className="border-b border-[#edf0f5] p-5">
            <h2 className="text-lg font-semibold text-[#101828]">Project health</h2>
            <p className="mt-1 text-sm text-[#667085]">Open, closed, and critical bugs by project.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#f7f8fb] text-xs uppercase text-[#667085]">
                <tr>
                  {["Project", "Total", "Open", "Closed", "Critical"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {report.projectRows.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#175cd3]">
                        {project.key}
                      </span>
                      <span className="ml-2 text-sm font-semibold text-[#101828]">{project.name}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#536173]">{project.totalBugs ?? 0}</td>
                    <td className="px-4 py-4 text-sm text-[#536173]">{project.openBugs ?? 0}</td>
                    <td className="px-4 py-4 text-sm text-[#536173]">{project.closedBugs ?? 0}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#b42318]">{project.criticalBugs ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="grid gap-6">
          <article className="glass-panel rounded-lg p-5">
            <h2 className="text-lg font-semibold text-[#101828]">Module heatmap</h2>
            <div className="mt-5 grid gap-4">
              {report.moduleRows.map((row) => (
                <div key={row.module}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#344054]">{row.module}</span>
                    <span className="text-[#667085]">{row.count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#edf0f5]">
                    <div className="h-2 rounded-full bg-[#f79009]" style={{ width: row.width }} />
                  </div>
                </div>
              ))}
              {report.moduleRows.length === 0 ? (
                <p className="text-sm text-[#667085]">No module data yet.</p>
              ) : null}
            </div>
          </article>

          <article className="glass-panel rounded-lg p-5">
            <h2 className="text-lg font-semibold text-[#101828]">Weekly report</h2>
            <p className="mt-3 text-sm leading-6 text-[#536173]">
              Closure rate is <span className="font-semibold text-[#101828]">{closureRate}%</span> across accessible
              projects, with <span className="font-semibold text-[#101828]">{report.totals.critical}</span> active
              critical bugs and <span className="font-semibold text-[#101828]">{report.totals.overdue}</span> overdue
              SLA items.
            </p>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {report.weeklyRows.map((row) => (
                <div key={row.day} className="rounded-md bg-[#f7f8fb] p-2 text-center">
                  <p className="text-xs font-semibold text-[#667085]">{row.day}</p>
                  <p className="mt-2 text-sm font-semibold text-[#101828]">{row.created}</p>
                  <p className="text-xs text-[#227245]">{row.closed} closed</p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
