import Link from "next/link";
import { ArrowRight, Bug, ClipboardList, Plus, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { healthClass } from "@/lib/sample-data";
import { listProjectsForUser } from "@/lib/local-db";

type ProjectsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const canCreateProject = session.user.accountType === "user";
  const projects = listProjectsForUser(session.user.id).map((project) => {
    const criticalBugs = project.criticalBugs ?? 0;
    const health: "Healthy" | "Watch" | "At Risk" =
      criticalBugs > 5 ? "At Risk" : criticalBugs > 0 ? "Watch" : "Healthy";

    return {
      id: project.id,
      key: project.key,
      name: project.name,
      owner: project.owner,
      openBugs: project.openBugs,
      criticalBugs,
      members: project.members,
      health,
    };
  });

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 border-b border-[#e1e7f0] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 text-sm font-semibold text-[#227245]">
            <Bug size={18} />
            Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-[#101828]">Projects</h1>
          <p className="mt-2 text-sm text-[#667085]">
            Manage products, owners, team members, and project-level bug health.
          </p>
        </div>
        {canCreateProject ? (
          <Link
            href="/projects/new"
            className="premium-button inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white"
          >
            <Plus size={18} />
            New project
          </Link>
        ) : null}
      </header>

      {params.error ? (
        <p className="mx-auto mt-6 w-full max-w-7xl rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
          {params.error}
        </p>
      ) : null}

      <section className="mx-auto mt-6 grid w-full max-w-7xl gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <article key={project.key} className="lift-card rounded-lg border border-[#e1e7f0] bg-white/92 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#175cd3]">
                  {project.key}
                </span>
                <h2 className="mt-4 text-xl font-semibold text-[#101828]">{project.name}</h2>
                <p className="mt-2 text-sm text-[#667085]">Owner: {project.owner}</p>
              </div>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${healthClass(project.health)}`}>
                {project.health}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-md bg-[#f7f8fb] p-3">
                <p className="text-xl font-semibold text-[#101828]">{project.openBugs}</p>
                <p className="mt-1 text-xs text-[#667085]">Open</p>
              </div>
              <div className="rounded-md bg-[#f7f8fb] p-3">
                <p className="text-xl font-semibold text-[#101828]">{project.criticalBugs}</p>
                <p className="mt-1 text-xs text-[#667085]">Critical</p>
              </div>
              <div className="rounded-md bg-[#f7f8fb] p-3">
                <p className="text-xl font-semibold text-[#101828]">{project.members}</p>
                <p className="mt-1 text-xs text-[#667085]">Members</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#edf0f5] pt-4">
              <span className="inline-flex items-center gap-2 text-sm text-[#667085]">
                <UsersRound size={16} />
                Role access ready
              </span>
              <Link href={`/bugs?q=${encodeURIComponent(project.name)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#227245]">
                View bugs
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#cad2de] bg-white p-8 text-center lg:col-span-3">
            <p className="text-sm font-semibold text-[#344054]">No projects yet</p>
            <p className="mt-2 text-sm text-[#667085]">Create your first project to start tracking bugs.</p>
          </div>
        ) : null}
      </section>

      <section className="glass-panel mx-auto mt-6 w-full max-w-7xl rounded-lg p-5">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-[#4e8cff]" size={22} />
          <h2 className="text-lg font-semibold text-[#101828]">Project workflow</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {["Create project", "Add team", "Assign bugs", "Track releases"].map((step) => (
            <div key={step} className="rounded-md border border-[#edf0f5] p-4">
              <p className="text-sm font-semibold text-[#344054]">{step}</p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                Available through protected project workflows.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
