import Link from "next/link";
import {
  BarChart3,
  Bot,
  Bug,
  FolderKanban,
  KanbanSquare,
  Lightbulb,
  LogOut,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { logoutAction } from "@/app/actions/auth";
import { updateBugWorkflowAction } from "@/app/actions/bugs";
import { updateWorkspaceRoleAction } from "@/app/actions/admin";
import { roleLabel, workspaceRoles } from "@/lib/authz";
import {
  getAdminSnapshot,
  listAdminControlBugs,
  listWorkspaceUsersForAssignment,
} from "@/lib/local-db";

type AdminPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const adminLinks = [
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Team", href: "/team", icon: UserPlus },
  { label: "Bugs", href: "/bugs", icon: KanbanSquare },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

const statusOptions = [
  ["OPEN", "Open"],
  ["TRIAGED", "Triaged"],
  ["IN_PROGRESS", "In Progress"],
  ["QA_VERIFY", "QA Verify"],
  ["RESOLVED", "Resolved"],
  ["CLOSED", "Closed"],
  ["REOPENED", "Reopened"],
];

function solutionHint(input: { priority: string; severity: string; module: string; status: string }) {
  if (input.priority === "CRITICAL" || input.severity === "BLOCKER") {
    return `Escalate ${input.module}, assign a developer, reproduce first, then move to QA after a patch is attached.`;
  }

  if (input.status === "OPEN") {
    return `Triage ${input.module}, confirm reproducibility, and assign the best owner before development starts.`;
  }

  if (input.status === "IN_PROGRESS") {
    return `Ask for fix notes, test impact area, and prepare QA verification steps for ${input.module}.`;
  }

  return `Keep this moving with clear ownership, latest comment, and the next workflow status.`;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  if (session.user.accountType !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const snapshot = getAdminSnapshot();
  const controlBugs = listAdminControlBugs();
  const assignableUsers = listWorkspaceUsersForAssignment();
  const totals = [
    { label: "Users", value: snapshot.totals.users, icon: UsersRound, color: "text-[#4e8cff]" },
    { label: "Projects", value: snapshot.totals.projects, icon: FolderKanban, color: "text-[#175cd3]" },
    { label: "Total bugs", value: snapshot.totals.bugs, icon: Bug, color: "text-[#f79009]" },
    { label: "Open bugs", value: snapshot.totals.open, icon: BarChart3, color: "text-[#12b76a]" },
  ];

  return (
    <main className="pro-admin min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <header className="dark-glass mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-[#9be7b0]">
            <Bug size={18} />
            E-Bug Tracker
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-white text-[#132238]">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Admin control center</h1>
              <p className="mt-1 text-sm text-white/70">Control workspace roles, assignments, solutions, and system health.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md border border-[#b8dfc4] bg-[#eef7f1] px-3 py-2 text-sm font-semibold text-[#227245]">
            Admin session verified
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/20 bg-white px-3 text-sm font-semibold text-[#344054] hover:bg-[#f7f8fb]"
            >
              <LogOut size={17} />
              Logout
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-4 md:grid-cols-4">
        {totals.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="lift-card rounded-lg border border-white/80 bg-white/92 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#667085]">{label}</p>
              <Icon size={20} className={color} />
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#101828]">{value}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-3 md:grid-cols-4">
        {adminLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex h-12 items-center justify-center gap-2 rounded-md border border-white/70 bg-white/92 text-sm font-semibold text-[#344054] shadow-sm transition hover:border-[#9eabbc] hover:bg-white"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </section>

      {params.error ? (
        <p className="mx-auto mt-6 w-full max-w-7xl rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
          {params.error}
        </p>
      ) : null}

      <section className="glass-panel mx-auto mt-6 w-full max-w-7xl overflow-hidden rounded-lg">
        <div className="border-b border-[#edf0f5] p-5">
          <div className="flex items-center gap-3">
            <Lightbulb className="text-[#f79009]" size={21} />
            <div>
              <h2 className="text-lg font-semibold text-[#101828]">Admin bug control</h2>
              <p className="mt-1 text-sm text-[#667085]">Assign owners, move workflow, and follow suggested next action.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead className="bg-[#f7f8fb] text-xs uppercase text-[#667085]">
              <tr>
                {["Bug", "Project", "Priority", "Solution guidance", "Control"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0f5]">
              {controlBugs.map((bug) => (
                <tr key={bug.id}>
                  <td className="px-4 py-4">
                    <Link href={`/bugs/${bug.id}`} className="text-sm font-semibold text-[#175cd3] hover:underline">
                      {bug.bugKey}
                    </Link>
                    <p className="mt-1 text-sm font-semibold text-[#101828]">{bug.title}</p>
                    <p className="mt-1 text-xs text-[#667085]">
                      {bug.module} / Reporter: {bug.reporter}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#536173]">{bug.project}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-[#fff4ed] px-2 py-1 text-xs font-semibold text-[#b54708]">
                      {bug.priority}
                    </span>
                    <p className="mt-2 text-xs text-[#667085]">{bug.severity}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3 rounded-md bg-[#f7f8fb] p-3">
                      <Bot className="mt-0.5 shrink-0 text-[#227245]" size={18} />
                      <p className="text-sm leading-6 text-[#536173]">
                        {solutionHint(bug)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <form action={updateBugWorkflowAction} className="flex items-center gap-2">
                      <input type="hidden" name="bugId" value={bug.id} />
                      <select
                        name="status"
                        defaultValue={bug.status}
                        className="h-10 rounded-md border border-[#cad2de] bg-white px-2 text-sm font-semibold text-[#344054] outline-none focus:border-[#4e8cff]"
                      >
                        {statusOptions.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <select
                        name="assigneeId"
                        defaultValue={bug.assigneeId ?? ""}
                        className="h-10 rounded-md border border-[#cad2de] bg-white px-2 text-sm font-semibold text-[#344054] outline-none focus:border-[#4e8cff]"
                      >
                        <option value="">Unassigned</option>
                        {assignableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="h-10 rounded-md bg-[#132238] px-3 text-sm font-semibold text-white hover:bg-[#203653]"
                      >
                        Apply
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {controlBugs.length === 0 ? (
          <div className="border-t border-[#edf0f5] p-8 text-center">
            <p className="text-sm font-semibold text-[#344054]">No active bugs need control</p>
            <p className="mt-2 text-sm text-[#667085]">New open bugs will appear here for admin action.</p>
          </div>
        ) : null}
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-6 xl:grid-cols-[1fr_420px]">
        <article className="glass-panel rounded-lg">
          <div className="border-b border-[#edf0f5] p-5">
            <h2 className="text-lg font-semibold text-[#101828]">Workspace users</h2>
            <p className="mt-1 text-sm text-[#667085]">Role changes are protected by admin-only server actions.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] border-collapse text-left">
              <thead className="bg-[#f7f8fb] text-xs uppercase text-[#667085]">
                <tr>
                  {["User", "Role", "Memberships", "Assigned", "Joined"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {snapshot.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#101828]">{user.name}</p>
                      <p className="mt-1 text-xs text-[#667085]">{user.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <form action={updateWorkspaceRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          name="role"
                          defaultValue={user.workspaceRole}
                          className="h-10 rounded-md border border-[#cad2de] bg-white px-2 text-sm font-semibold text-[#344054] outline-none focus:border-[#4e8cff]"
                        >
                          {workspaceRoles.map((role) => (
                            <option key={role} value={role}>
                              {roleLabel(role)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="h-10 rounded-md border border-[#cad2de] px-3 text-sm font-semibold text-[#344054] hover:border-[#9eabbc]"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#536173]">{user.memberships}</td>
                    <td className="px-4 py-4 text-sm text-[#536173]">{user.assignedBugs}</td>
                    <td className="px-4 py-4 text-sm text-[#536173]">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="glass-panel rounded-lg">
          <div className="border-b border-[#edf0f5] p-5">
            <h2 className="text-lg font-semibold text-[#101828]">Projects</h2>
            <p className="mt-1 text-sm text-[#667085]">Workspace-wide project overview.</p>
          </div>
          <div className="divide-y divide-[#edf0f5]">
            {snapshot.projects.map((project) => (
              <div key={project.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#175cd3]">
                      {project.key}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-[#101828]">{project.name}</p>
                    <p className="mt-1 text-xs text-[#667085]">Owner: {project.owner}</p>
                  </div>
                  <span className="rounded-md bg-[#f7f8fb] px-2 py-1 text-xs font-semibold text-[#344054]">
                    {project.openBugs ?? 0} open
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#536173]">
                  {project.members} members / {project.totalBugs ?? 0} bugs
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
