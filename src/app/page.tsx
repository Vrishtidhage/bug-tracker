import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  Bug,
  CheckCircle2,
  Clock3,
  Code2,
  GitPullRequest,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { auth } from "../../auth";

const workflow = [
  {
    title: "Report",
    description: "QA logs a reproducible bug with environment, files, and severity.",
  },
  {
    title: "Triage",
    description: "Leads assign priority, owner, SLA, labels, and release target.",
  },
  {
    title: "Resolve",
    description: "Developers link fixes, discuss blockers, and move work across the board.",
  },
  {
    title: "Verify",
    description: "Testers validate the fix, close the issue, and preserve the audit trail.",
  },
];

const highlights = [
  { label: "AI assistant", icon: Bot },
  { label: "AI duplicate checks", icon: Sparkles },
  { label: "Role-based workflows", icon: ShieldCheck },
  { label: "SLA timers", icon: Timer },
  { label: "GitHub PR linking", icon: GitPullRequest },
  { label: "Smart search", icon: Search },
  { label: "Audit activity", icon: Activity },
];

const metrics = [
  { value: "128", label: "tracked bugs" },
  { value: "24h", label: "critical SLA" },
  { value: "91%", label: "weekly closure" },
];

const aboutCards = [
  {
    title: "Built for QA teams",
    description: "Every report captures the context developers need: steps, environment, severity, ownership, and audit history.",
    icon: Search,
  },
  {
    title: "Designed for delivery",
    description: "Dashboards, SLA watch, assignments, and reports help teams move from issue discovery to verified release.",
    icon: Clock3,
  },
  {
    title: "Admin controlled",
    description: "A separate admin console keeps access, roles, members, and project health under secure supervision.",
    icon: ShieldCheck,
  },
];

export default async function Home() {
  const session = await auth();
  const dashboardHref = session?.user?.accountType === "admin" ? "/admin" : "/dashboard";
  const signedInLabel =
    session?.user?.accountType === "admin"
      ? `Admin signed in as ${session.user.email}`
      : session?.user?.email
        ? `User signed in as ${session.user.email}`
        : null;

  return (
    <main className="pro-page min-h-screen text-[#172033]">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#132238] text-white shadow-lg shadow-[#132238]/20">
            <Bug size={22} />
          </span>
          <span className="text-lg font-semibold tracking-tight">E-Bug Tracker</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {session?.user ? (
            <>
              <Link
                href={dashboardHref}
                className="premium-button rounded-md px-4 py-2 text-sm font-semibold text-white"
              >
                Open dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-[#cad2de] px-3 py-2 text-sm font-semibold text-[#344054] hover:border-[#9eabbc] hover:bg-white"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-[#4a5568] hover:bg-white hover:text-[#172033]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="premium-button rounded-md px-4 py-2 text-sm font-semibold text-white"
              >
                Create account
              </Link>
              <Link
                href="/admin/login"
                className="rounded-md border border-[#cad2de] px-3 py-2 text-sm font-semibold text-[#344054] hover:border-[#9eabbc] hover:bg-white"
              >
                Admin
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-7xl items-center gap-10 px-5 pb-10 pt-4 sm:px-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#d7e2dc] bg-white/85 px-3 py-2 text-sm font-medium text-[#31533e] shadow-sm backdrop-blur">
            <CheckCircle2 size={16} />
            {signedInLabel ?? "Built for real team bug workflows"}
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] text-[#101828] sm:text-5xl lg:text-6xl">
            Track every bug with clarity, ownership, and confidence.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#536173]">
            A clean issue tracking workspace for projects, QA reports,
            assignments, SLA timers, duplicate detection, analytics, and
            release-ready bug closure.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {session?.user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="premium-button inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white"
                >
                  Open dashboard
                  <ArrowRight size={18} />
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#cad2de] bg-white/90 px-5 text-sm font-semibold text-[#172033] shadow-sm hover:border-[#9eabbc]"
                  >
                    <Lock size={18} />
                    Logout and test fresh
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="premium-button inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white"
                >
                  Register as user
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#cad2de] bg-white/90 px-5 text-sm font-semibold text-[#172033] shadow-sm hover:border-[#9eabbc]"
                >
                  <Lock size={18} />
                  User login
                </Link>
                <Link
                  href="/admin/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#cad2de] bg-white/90 px-5 text-sm font-semibold text-[#172033] shadow-sm hover:border-[#9eabbc]"
                >
                  <ShieldCheck size={18} />
                  Admin login
                </Link>
              </>
            )}
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="glass-panel rounded-lg p-4 text-center">
                <p className="text-2xl font-semibold text-[#132238]">{metric.value}</p>
                <p className="mt-1 text-sm text-[#667085]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel overflow-hidden rounded-lg p-0">
          <div className="media-overlay flex min-h-[250px] items-end p-5 text-white">
            <div>
              <p className="text-sm font-semibold text-white/85">Live workspace view</p>
              <h2 className="mt-2 text-2xl font-semibold">Triage, assign, resolve</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">
                Product, QA, and engineering work from the same secure source of truth.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-[#edf0f5] bg-white/90 p-4">
            <div>
              <p className="text-sm font-semibold text-[#101828]">Live triage board</p>
              <p className="text-sm text-[#667085]">Project: Customer Portal</p>
            </div>
            <button
              type="button"
              aria-label="View notifications"
              className="flex size-10 items-center justify-center rounded-md border border-[#d7deea] text-[#536173] hover:bg-[#f7f8fb]"
            >
              <Bell size={18} />
            </button>
          </div>

          <div className="grid gap-3 bg-white/90 p-4">
            {[
              ["Critical", "Payment callback fails after retry", "Overdue in 2h", "#f04438"],
              ["High", "Login page freezes on mobile Safari", "Assigned to Mira", "#f79009"],
              ["Medium", "Profile image crop loses transparency", "Ready for QA", "#12b76a"],
            ].map(([priority, title, meta, color]) => (
              <div key={title} className="lift-card rounded-lg border border-[#e4e9f1] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-md px-2 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {priority}
                  </span>
                  <span className="text-xs font-medium text-[#667085]">{meta}</span>
                </div>
                <p className="mt-3 font-semibold text-[#172033]">{title}</p>
                <div className="mt-4 h-2 rounded-full bg-[#edf0f5]">
                  <div className="h-2 w-2/3 rounded-full bg-[#4e8cff]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <div className="soft-divider mb-10" />
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="glass-panel overflow-hidden rounded-lg">
            <div className="min-h-[360px] bg-[linear-gradient(180deg,rgba(16,24,40,0.08),rgba(16,24,40,0.68)),url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center p-6 text-white">
              <div className="flex h-full min-h-[300px] flex-col justify-between">
                <span className="w-fit rounded-md bg-white/16 px-3 py-2 text-sm font-semibold backdrop-blur">
                  About E-Bug Tracker
                </span>
                <div>
                  <h2 className="max-w-lg text-3xl font-semibold leading-tight">
                    A focused workspace for teams that care about clean releases.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/78">
                    We built this project around a simple idea: bug tracking should be fast for testers, clear for
                    developers, and controlled for admins.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {aboutCards.map(({ title, description, icon: Icon }) => (
              <article key={title} className="lift-card rounded-lg border border-[#dde5ef] bg-white/92 p-5">
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#eef7f1] text-[#227245]">
                    <Icon size={21} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[#101828]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
                  </div>
                </div>
              </article>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-lg p-5">
                <Code2 className="text-[#4e8cff]" size={24} />
                <p className="mt-4 text-sm font-semibold text-[#101828]">End-to-end project ready</p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  Authentication, admin control, user dashboard, reports, notifications, and assistant support.
                </p>
              </div>
              <div className="glass-panel rounded-lg p-5">
                <GitPullRequest className="text-[#227245]" size={24} />
                <p className="mt-4 text-sm font-semibold text-[#101828]">Built for future integrations</p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  The structure is ready for deployment, GitHub linking, AI upgrades, and production databases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e2e8f0] bg-white/88 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-8 sm:px-8 md:grid-cols-3 lg:grid-cols-6">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-[#eef7f1] text-[#227245]">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold text-[#344054]">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="soft-divider mb-10" />
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#227245]">
              Product flow
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[#101828]">
              From bug report to verified release
            </h2>
          </div>
          <Lock className="hidden text-[#8a95a7] sm:block" size={26} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {workflow.map((step, index) => (
            <div key={step.title} className="lift-card rounded-lg border border-[#dde5ef] bg-white/92 p-5">
              <span className="text-sm font-semibold text-[#227245]">
                Step {index + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-[#101828]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
