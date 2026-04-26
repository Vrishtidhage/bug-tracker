import Link from "next/link";
import { BriefcaseBusiness, Bug, Mail, Plus, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { addTeamMemberAction } from "@/app/actions/team";
import { canManageTeam } from "@/lib/authz";
import { findUserById, listProjectOptionsForUser, listTeamMembersForUser } from "@/lib/local-db";

type TeamPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const roles = [
  ["MANAGER", "Manager"],
  ["DEVELOPER", "Developer"],
  ["TESTER", "Tester"],
  ["VIEWER", "Viewer"],
];

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const currentUser = findUserById(session.user.id);
  const canManage = canManageTeam(currentUser?.workspaceRole ?? session.user.role);
  const projects = listProjectOptionsForUser(session.user.id);
  const members = listTeamMembersForUser(session.user.id);

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 border-b border-[#e1e7f0] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 text-sm font-semibold text-[#227245]">
            <Bug size={18} />
            Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-[#101828]">Team</h1>
          <p className="mt-2 text-sm text-[#667085]">
            Add teammates to projects so bugs can be assigned and tracked by role.
          </p>
        </div>
        <div className="glass-panel flex items-center gap-3 rounded-lg px-4 py-3">
          <UsersRound size={20} className="text-[#4e8cff]" />
          <div>
            <p className="text-sm font-semibold text-[#101828]">{members.length} memberships</p>
            <p className="text-xs text-[#667085]">Across accessible projects</p>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-6 grid w-full max-w-7xl gap-6 xl:grid-cols-[380px_1fr]">
        {canManage ? (
        <section className="glass-panel rounded-lg p-5">
          <div className="flex items-center gap-3">
            <Plus className="text-[#227245]" size={20} />
            <h2 className="text-lg font-semibold text-[#101828]">Add teammate</h2>
          </div>

          {params.error ? (
            <p className="mt-5 rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
              {params.error}
            </p>
          ) : null}

          <form action={addTeamMemberAction} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Name
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <UserRound size={18} className="text-[#667085]" />
                <input name="name" type="text" className="w-full bg-transparent text-sm outline-none" required />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Email
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <Mail size={18} className="text-[#667085]" />
                <input name="email" type="email" className="w-full bg-transparent text-sm outline-none" required />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Project
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <BriefcaseBusiness size={18} className="text-[#667085]" />
                <select name="projectId" className="w-full bg-transparent text-sm outline-none" required>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Role
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <ShieldCheck size={18} className="text-[#667085]" />
                <select name="role" className="w-full bg-transparent text-sm outline-none" required>
                  {roles.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <button
              type="submit"
              disabled={projects.length === 0}
              className="h-11 rounded-md bg-[#132238] px-4 text-sm font-semibold text-white hover:bg-[#203653] disabled:cursor-not-allowed disabled:bg-[#98a2b3]"
            >
              Add teammate
            </button>
          </form>
        </section>
        ) : (
          <section className="glass-panel rounded-lg p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#227245]" size={20} />
              <h2 className="text-lg font-semibold text-[#101828]">Read-only access</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#667085]">
              Your role can view project members, while admins and managers handle teammate changes.
            </p>
          </section>
        )}

        <section className="glass-panel rounded-lg">
          <div className="border-b border-[#edf0f5] p-5">
            <h2 className="text-lg font-semibold text-[#101828]">Members</h2>
            <p className="mt-1 text-sm text-[#667085]">Project access and assigned workload.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#f7f8fb] text-xs uppercase text-[#667085]">
                <tr>
                  {["Name", "Email", "Project", "Role", "Open assigned"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {members.map((member) => (
                  <tr key={`${member.id}-${member.projectKey}`} className="hover:bg-[#fbfcfe]">
                    <td className="px-4 py-4 text-sm font-semibold text-[#101828]">{member.name}</td>
                    <td className="px-4 py-4 text-sm text-[#536173]">{member.email}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#175cd3]">
                        {member.projectKey}
                      </span>
                      <span className="ml-2 text-sm text-[#536173]">{member.project}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#344054]">{member.role}</td>
                    <td className="px-4 py-4 text-sm text-[#536173]">{member.openAssigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {members.length === 0 ? (
            <div className="border-t border-[#edf0f5] p-8 text-center">
              <p className="text-sm font-semibold text-[#344054]">No team members yet</p>
              <p className="mt-2 text-sm text-[#667085]">Add a teammate after creating a project.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
