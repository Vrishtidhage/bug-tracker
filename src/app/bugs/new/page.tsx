import Link from "next/link";
import { ArrowLeft, Bug, Lightbulb, SearchCheck, Upload } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { checkBugHintsAction, createBugAction } from "@/app/actions/bugs";
import { canCreateBugs } from "@/lib/authz";
import { findSimilarBugsForUser, findUserById, listProjectOptionsForUser } from "@/lib/local-db";
import { suggestPriority } from "@/lib/bug-schemas";

type NewBugPageProps = {
  searchParams: Promise<{
    error?: string;
    hints?: string;
    projectId?: string;
    module?: string;
    title?: string;
    description?: string;
    priority?: string;
    severity?: string;
    environment?: string;
    stepsToReproduce?: string;
    expectedResult?: string;
    actualResult?: string;
    browser?: string;
    operatingSystem?: string;
    device?: string;
    appVersion?: string;
  }>;
};

export default async function NewBugPage({ searchParams }: NewBugPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = findUserById(session.user.id);

  if (!canCreateBugs(currentUser?.workspaceRole ?? session.user.role)) {
    redirect("/bugs");
  }

  const params = await searchParams;
  const projects = listProjectOptionsForUser(session.user.id);
  const formValues = {
    projectId: params.projectId ?? projects[0]?.id ?? "",
    module: params.module ?? "",
    title: params.title ?? "",
    description: params.description ?? "",
    priority: params.priority ?? "MEDIUM",
    severity: params.severity ?? "MAJOR",
    environment: params.environment ?? "STAGING",
    stepsToReproduce: params.stepsToReproduce ? decodeURIComponent(params.stepsToReproduce) : "",
    expectedResult: params.expectedResult ? decodeURIComponent(params.expectedResult) : "",
    actualResult: params.actualResult ? decodeURIComponent(params.actualResult) : "",
    browser: params.browser ? decodeURIComponent(params.browser) : "",
    operatingSystem: params.operatingSystem ? decodeURIComponent(params.operatingSystem) : "",
    device: params.device ? decodeURIComponent(params.device) : "",
    appVersion: params.appVersion ? decodeURIComponent(params.appVersion) : "",
  };
  const shouldShowHints = params.hints === "1";
  const similarBugs = shouldShowHints
    ? findSimilarBugsForUser(session.user.id, {
        title: formValues.title,
        module: formValues.module,
        description: formValues.description,
      })
    : [];
  const priorityHint = shouldShowHints
    ? suggestPriority(`${formValues.title} ${formValues.module} ${formValues.description} ${formValues.actualResult}`)
    : null;

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link href="/bugs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#227245]">
          <ArrowLeft size={18} />
          Back to bugs
        </Link>

        <header className="mt-5 border-b border-[#e1e7f0] pb-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-[#132238] text-white">
              <Bug size={22} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-[#101828]">Report a bug</h1>
              <p className="mt-1 text-sm text-[#667085]">
                Capture reproducible details so triage and fixes move faster.
              </p>
            </div>
          </div>
        </header>

        {params.error ? (
          <p className="mt-6 rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
            {params.error}
          </p>
        ) : null}

        {shouldShowHints ? (
          <section className="mt-6 grid gap-4 rounded-lg border border-[#d7e2dc] bg-white p-5">
            <div className="flex items-center gap-3">
              <Lightbulb className="text-[#227245]" size={20} />
              <h2 className="text-lg font-semibold text-[#101828]">Smart report hints</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-[#edf0f5] p-4">
                <p className="text-sm font-semibold text-[#344054]">Suggested priority</p>
                <p className="mt-2 text-2xl font-semibold text-[#101828]">{priorityHint?.priority}</p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{priorityHint?.reason}</p>
              </div>
              <div className="rounded-lg border border-[#edf0f5] p-4">
                <p className="text-sm font-semibold text-[#344054]">Possible duplicates</p>
                <div className="mt-3 grid gap-3">
                  {similarBugs.map((bug) => (
                    <Link key={bug.id} href={`/bugs/${bug.id}`} className="rounded-md bg-[#f7f8fb] p-3 hover:bg-[#eef3ff]">
                      <p className="text-sm font-semibold text-[#101828]">{bug.bugKey}: {bug.title}</p>
                      <p className="mt-1 text-xs text-[#667085]">{bug.project} / {bug.module} / score {bug.score}</p>
                    </Link>
                  ))}
                  {similarBugs.length === 0 ? (
                    <p className="text-sm text-[#667085]">No strong duplicate candidates found.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <form action={createBugAction} className="glass-panel mt-6 grid gap-6 rounded-lg p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Project
              <select
                name="projectId"
                defaultValue={formValues.projectId}
                className="h-11 rounded-md border border-[#cad2de] bg-white px-3 text-sm outline-none focus:border-[#4e8cff]"
                required
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Module
              <input
                name="module"
                type="text"
                defaultValue={formValues.module}
                placeholder="Authentication, Checkout, Reports"
                className="h-11 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]"
                required
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-[#344054]">
            Bug title
            <input
              name="title"
              type="text"
              defaultValue={formValues.title}
              placeholder="Short, clear summary"
              className="h-11 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#344054]">
            Description
            <textarea
              name="description"
              defaultValue={formValues.description}
              placeholder="What happened and who is affected?"
              rows={4}
              className="rounded-md border border-[#cad2de] px-3 py-3 text-sm outline-none focus:border-[#4e8cff]"
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Priority
              <select name="priority" defaultValue={priorityHint?.priority ?? formValues.priority} className="h-11 rounded-md border border-[#cad2de] bg-white px-3 text-sm outline-none focus:border-[#4e8cff]">
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Severity
              <select name="severity" defaultValue={formValues.severity} className="h-11 rounded-md border border-[#cad2de] bg-white px-3 text-sm outline-none focus:border-[#4e8cff]">
                <option value="BLOCKER">Blocker</option>
                <option value="MAJOR">Major</option>
                <option value="MINOR">Minor</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Environment
              <select name="environment" defaultValue={formValues.environment} className="h-11 rounded-md border border-[#cad2de] bg-white px-3 text-sm outline-none focus:border-[#4e8cff]">
                <option value="PRODUCTION">Production</option>
                <option value="STAGING">Staging</option>
                <option value="DEVELOPMENT">Development</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Steps to reproduce
              <textarea
                name="stepsToReproduce"
                defaultValue={formValues.stepsToReproduce}
                rows={5}
                placeholder="1. Open login page&#10;2. Enter credentials&#10;3. Tap submit"
                className="rounded-md border border-[#cad2de] px-3 py-3 text-sm outline-none focus:border-[#4e8cff]"
                required
              />
            </label>

            <div className="grid gap-5">
              <label className="grid gap-2 text-sm font-medium text-[#344054]">
                Expected result
                <textarea
                  name="expectedResult"
                  defaultValue={formValues.expectedResult}
                  rows={2}
                  className="rounded-md border border-[#cad2de] px-3 py-3 text-sm outline-none focus:border-[#4e8cff]"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#344054]">
                Actual result
                <textarea
                  name="actualResult"
                  defaultValue={formValues.actualResult}
                  rows={2}
                  className="rounded-md border border-[#cad2de] px-3 py-3 text-sm outline-none focus:border-[#4e8cff]"
                  required
                />
              </label>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Browser
              <input name="browser" type="text" defaultValue={formValues.browser} className="h-11 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              OS
              <input name="operatingSystem" type="text" defaultValue={formValues.operatingSystem} className="h-11 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Device
              <input name="device" type="text" defaultValue={formValues.device} className="h-11 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              App version
              <input name="appVersion" type="text" defaultValue={formValues.appVersion} className="h-11 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]" />
            </label>
          </div>

          <div className="rounded-lg border border-dashed border-[#b9c4d3] bg-[#fbfcfe] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-white text-[#4e8cff]">
                  <Upload size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#344054]">Attachments</p>
                  <p className="mt-1 text-sm text-[#667085]">
                    Screenshots and logs will connect to file uploads later.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#cad2de] bg-white px-4 text-sm font-semibold text-[#344054]"
              >
                Choose files
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#edf0f5] pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/bugs"
              className="inline-flex h-11 items-center justify-center rounded-md border border-[#cad2de] px-4 text-sm font-semibold text-[#344054]"
            >
              Cancel
            </Link>
            <button
              formAction={checkBugHintsAction}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cad2de] px-4 text-sm font-semibold text-[#344054] hover:border-[#9eabbc]"
            >
              <SearchCheck size={18} />
              Check similar bugs
            </button>
            <button
              type="submit"
              disabled={projects.length === 0}
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#132238] px-4 text-sm font-semibold text-white hover:bg-[#203653]"
            >
              Create bug
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
