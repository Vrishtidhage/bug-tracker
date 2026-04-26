import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, CircleDot, MessageSquare, Send, UserRound } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { addBugCommentAction, updateBugWorkflowAction } from "@/app/actions/bugs";
import { canUpdateBugs } from "@/lib/authz";
import {
  findUserById,
  getBugForUser,
  listAssignableUsersForBug,
  listBugActivitiesForUser,
  listBugCommentsForUser,
} from "@/lib/local-db";
import { priorityClass } from "@/lib/sample-data";

const priorityLabel: Record<string, "Low" | "Medium" | "High" | "Critical"> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const statusOptions = [
  ["OPEN", "Open"],
  ["TRIAGED", "Triaged"],
  ["IN_PROGRESS", "In Progress"],
  ["QA_VERIFY", "QA Verify"],
  ["RESOLVED", "Resolved"],
  ["CLOSED", "Closed"],
  ["REOPENED", "Reopened"],
];

type BugDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BugDetailPage({ params }: BugDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const currentUser = findUserById(session.user.id);
  const canUpdate = canUpdateBugs(currentUser?.workspaceRole ?? session.user.role);
  const bug = getBugForUser(session.user.id, id);

  if (!bug) {
    notFound();
  }

  const activities = listBugActivitiesForUser(session.user.id, id);
  const comments = listBugCommentsForUser(session.user.id, id);
  const assignableUsers = listAssignableUsersForBug(session.user.id, id);
  const priority = priorityLabel[bug.priority] ?? "Medium";

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Link href="/bugs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#227245]">
          <ArrowLeft size={18} />
          Back to bugs
        </Link>

        <header className="mt-5 grid gap-5 border-b border-[#e1e7f0] pb-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#175cd3]">
                {bug.bugKey}
              </span>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityClass(priority)}`}>
                {priority}
              </span>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#536173]">
                {bug.status.replaceAll("_", " ")}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#101828]">{bug.title}</h1>
            <p className="mt-3 text-sm text-[#667085]">
              {bug.project} / {bug.module}
            </p>
          </div>

          {canUpdate ? (
          <form action={updateBugWorkflowAction} className="glass-panel rounded-lg p-4">
            <input type="hidden" name="bugId" value={bug.id} />
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-[#344054]">
                Status
                <select
                  name="status"
                  defaultValue={bug.status}
                  className="h-11 rounded-md border border-[#cad2de] bg-white px-3 text-sm outline-none focus:border-[#4e8cff]"
                >
                  {statusOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#344054]">
                Assignee
                <select
                  name="assigneeId"
                  defaultValue={bug.assigneeId ?? ""}
                  className="h-11 rounded-md border border-[#cad2de] bg-white px-3 text-sm outline-none focus:border-[#4e8cff]"
                >
                  <option value="">Unassigned</option>
                  {assignableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="h-11 rounded-md bg-[#132238] px-4 text-sm font-semibold text-white hover:bg-[#203653]"
              >
                Update workflow
              </button>
            </div>
          </form>
          ) : (
            <aside className="glass-panel rounded-lg p-4">
              <p className="text-sm font-semibold text-[#101828]">Read-only workflow</p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                Your role can inspect this bug, while admins, managers, developers, and testers update workflow.
              </p>
            </aside>
          )}
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="grid gap-6">
            <article className="glass-panel rounded-lg p-5">
              <h2 className="text-lg font-semibold text-[#101828]">Bug description</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#536173]">{bug.description}</p>
            </article>

            <article className="glass-panel grid gap-4 rounded-lg p-5 md:grid-cols-3">
              <div>
                <h2 className="text-sm font-semibold text-[#101828]">Steps to reproduce</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#536173]">{bug.stepsToReproduce}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#101828]">Expected result</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#536173]">{bug.expectedResult}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#101828]">Actual result</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#536173]">{bug.actualResult}</p>
              </div>
            </article>

            <article className="glass-panel rounded-lg p-5">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-[#4e8cff]" size={20} />
                <h2 className="text-lg font-semibold text-[#101828]">Comments</h2>
              </div>

              <div className="mt-5 grid gap-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-[#edf0f5] bg-[#fbfcfe] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#344054]">{comment.author}</p>
                      <p className="text-xs text-[#667085]">
                        {new Date(comment.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#536173]">{comment.body}</p>
                  </div>
                ))}

                {comments.length === 0 ? (
                  <p className="rounded-md border border-dashed border-[#cad2de] p-4 text-sm text-[#667085]">
                    No comments yet.
                  </p>
                ) : null}
              </div>

              {canUpdate ? (
              <form action={addBugCommentAction} className="mt-5 grid gap-3 border-t border-[#edf0f5] pt-5">
                <input type="hidden" name="bugId" value={bug.id} />
                <label className="grid gap-2 text-sm font-medium text-[#344054]">
                  Add comment
                  <textarea
                    name="body"
                    rows={4}
                    placeholder="Share an update, verification note, or blocker"
                    className="rounded-md border border-[#cad2de] px-3 py-3 text-sm outline-none focus:border-[#4e8cff]"
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-11 w-fit items-center gap-2 rounded-md bg-[#132238] px-4 text-sm font-semibold text-white hover:bg-[#203653]"
                >
                  <Send size={18} />
                  Add comment
                </button>
              </form>
              ) : null}
            </article>
          </section>

          <aside className="grid gap-6">
            <section className="glass-panel rounded-lg p-5">
              <h2 className="text-lg font-semibold text-[#101828]">Details</h2>
              <dl className="mt-5 grid gap-4 text-sm">
                {[
                  ["Reporter", bug.reporter],
                  ["Assignee", bug.assignee ?? "Unassigned"],
                  ["Severity", bug.severity],
                  ["Environment", bug.environment],
                  ["Browser", bug.browser ?? "Not set"],
                  ["OS", bug.operatingSystem ?? "Not set"],
                  ["Device", bug.device ?? "Not set"],
                  ["App version", bug.appVersion ?? "Not set"],
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
                <CalendarClock className="text-[#f79009]" size={20} />
                <h2 className="text-lg font-semibold text-[#101828]">SLA</h2>
              </div>
              <p className="mt-3 text-sm text-[#667085]">
                {bug.slaDueAt ? new Date(bug.slaDueAt).toLocaleString("en-IN") : "No SLA set"}
              </p>
            </section>

            <section className="glass-panel rounded-lg p-5">
              <h2 className="text-lg font-semibold text-[#101828]">Activity</h2>
              <div className="mt-5 grid gap-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <span className="mt-1 flex size-8 items-center justify-center rounded-md bg-[#eef7f1] text-[#227245]">
                      {activity.action === "STATUS_CHANGED" ? <CheckCircle2 size={16} /> : <CircleDot size={16} />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#344054]">
                        {activity.action.replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-[#667085]">
                        <UserRound size={14} />
                        {activity.actor} / {new Date(activity.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
