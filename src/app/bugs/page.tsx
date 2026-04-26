import Link from "next/link";
import { Bug, Filter, Plus, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { canCreateBugs } from "@/lib/authz";
import { priorityClass } from "@/lib/sample-data";
import { findUserById, searchBugsForUser } from "@/lib/local-db";

const priorityLabel = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
} as const;

const statusOptions = [
  ["", "All statuses"],
  ["OPEN", "Open"],
  ["TRIAGED", "Triaged"],
  ["IN_PROGRESS", "In Progress"],
  ["QA_VERIFY", "QA Verify"],
  ["RESOLVED", "Resolved"],
  ["CLOSED", "Closed"],
];

type BugsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function BugsPage({ searchParams }: BugsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const currentUser = findUserById(session.user.id);
  const canCreate = canCreateBugs(currentUser?.workspaceRole ?? session.user.role);
  const query = params.q ?? "";
  const status = params.status ?? "";
  const bugs = searchBugsForUser(session.user.id, query, status || undefined);

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 border-b border-[#e1e7f0] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 text-sm font-semibold text-[#227245]">
            <Bug size={18} />
            Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-[#101828]">Bugs</h1>
          <p className="mt-2 text-sm text-[#667085]">
            Search, triage, assign, and monitor all project issues.
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/bugs/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#132238] px-4 text-sm font-semibold text-white hover:bg-[#203653]"
          >
            <Plus size={18} />
            New bug
          </Link>
        ) : null}
      </header>

      <section className="glass-panel mx-auto mt-6 w-full max-w-7xl rounded-lg">
        <form className="flex flex-col gap-3 border-b border-[#edf0f5] p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex h-11 items-center gap-3 rounded-md border border-[#cad2de] px-3">
            <Search size={18} className="text-[#667085]" />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by key, title, module, assignee"
              className="w-full bg-transparent text-sm outline-none md:w-96"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded-md border border-[#cad2de] bg-white px-3 text-sm font-semibold text-[#344054] outline-none"
            >
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cad2de] px-4 text-sm font-semibold text-[#344054] hover:border-[#9eabbc]"
            >
              <Filter size={18} />
              Apply
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#f7f8fb] text-xs uppercase text-[#667085]">
              <tr>
                {["Key", "Title", "Project", "Status", "Priority", "Assignee", "SLA"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0f5]">
              {bugs.map((bug) => (
                <tr key={bug.id} className="hover:bg-[#fbfcfe]">
                  <td className="px-4 py-4 text-sm font-semibold text-[#175cd3]">
                    <Link href={`/bugs/${bug.id}`} className="hover:underline">
                      {bug.bugKey}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/bugs/${bug.id}`} className="text-sm font-semibold text-[#101828] hover:text-[#175cd3]">
                      {bug.title}
                    </Link>
                    <p className="mt-1 text-xs text-[#667085]">Module: {bug.module}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#536173]">{bug.project}</td>
                  <td className="px-4 py-4 text-sm text-[#536173]">{bug.status}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityClass(priorityLabel[bug.priority as keyof typeof priorityLabel] ?? "Medium")}`}>
                      {priorityLabel[bug.priority as keyof typeof priorityLabel] ?? bug.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#536173]">{bug.assignee ?? "Unassigned"}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#344054]">
                    {bug.slaDueAt ? new Date(bug.slaDueAt).toLocaleDateString("en-IN") : "Not set"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bugs.length === 0 ? (
          <div className="border-t border-[#edf0f5] p-8 text-center">
            <p className="text-sm font-semibold text-[#344054]">No bugs yet</p>
            <p className="mt-2 text-sm text-[#667085]">Create the first report from the New bug page.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
