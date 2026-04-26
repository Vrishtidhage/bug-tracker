import Link from "next/link";
import { ArrowRight, Bug, GitPullRequest, Lock, Mail } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { loginAction } from "@/app/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user?.accountType === "admin") {
    redirect("/admin");
  }

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-[#f4f7fb] text-[#172033] lg:grid-cols-[0.92fr_1.08fr]">
      <section className="pro-admin flex flex-col justify-between px-6 py-8 text-white sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-white text-[#132238]">
            <Bug size={22} />
          </span>
          <span className="text-lg font-semibold">E-Bug Tracker</span>
        </Link>
        <div className="dark-glass my-12 max-w-lg rounded-lg p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9be7b0]">
            Secure workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Continue tracking bugs with full context.
          </h1>
          <p className="mt-5 text-base leading-7 text-[#d8e1ef]">
            Login will connect to protected projects, assigned issues, SLA
            alerts, and your team activity feed.
          </p>
        </div>
        <p className="text-sm text-[#d8e1ef]">Protected dashboards, scoped projects, and audit-ready activity.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="glass-panel w-full max-w-md rounded-lg p-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#101828]">Login</h2>
            <p className="mt-2 text-sm text-[#667085]">
              Use your team account to enter the dashboard.
            </p>
          </div>

          {params.error ? (
            <p className="mt-6 rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
              {params.error}
            </p>
          ) : null}

          {params.registered ? (
            <p className="mt-6 rounded-md border border-[#b8dfc4] bg-[#eef7f1] px-3 py-2 text-sm font-semibold text-[#227245]">
              Account created. Please login to continue.
            </p>
          ) : null}

          <form action={loginAction} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Email address
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <Mail size={18} className="text-[#667085]" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Password
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <Lock size={18} className="text-[#667085]" />
                <input
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </span>
            </label>

            <Link href="/dashboard" className="text-sm font-semibold text-[#227245]">
              Forgot password?
            </Link>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#132238] px-5 text-sm font-semibold text-white shadow-lg shadow-[#132238]/20 hover:bg-[#203653]"
            >
              Login
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#cad2de] bg-white/90 px-5 text-sm font-semibold text-[#172033] hover:border-[#9eabbc]"
            >
              <GitPullRequest size={18} />
              Continue with Git provider
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#667085]">
            New workspace?{" "}
            <Link href="/register" className="font-semibold text-[#227245]">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-[#667085]">
            Admin?{" "}
            <Link href="/admin/login" className="font-semibold text-[#227245]">
              Use admin login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
