import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Bug, Lock, Mail, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { registerAction } from "@/app/actions/auth";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth();

  if (session?.user?.accountType === "admin") {
    redirect("/admin");
  }

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="pro-page min-h-screen px-5 py-8 text-[#172033] sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#132238] text-white">
            <Bug size={22} />
          </span>
          <span className="text-lg font-semibold">E-Bug Tracker</span>
        </Link>
        <Link href="/login" className="text-sm font-semibold text-[#227245]">
          Login
        </Link>
      </div>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 py-12 lg:grid-cols-[1fr_0.95fr]">
        <div className="glass-panel rounded-lg p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#227245]">
            Create workspace
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-[#101828]">
            Set up the team space where every bug has an owner and outcome.
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Project access", "Team roles", "Audit history"].map((item) => (
              <div key={item} className="lift-card rounded-lg border border-[#dfe6f0] bg-white p-4">
                <p className="text-sm font-semibold text-[#101828]">{item}</p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  Ready for the real auth and database layer.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-[#101828]">Register</h2>
          <p className="mt-2 text-sm text-[#667085]">
            Create a normal workspace user account. Admin access is separate.
          </p>

          {params.error ? (
            <p className="mt-6 rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
              {params.error}
            </p>
          ) : null}

          <form action={registerAction} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Full name
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <UserRound size={18} className="text-[#667085]" />
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Work email
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
                  placeholder="Minimum 8 characters"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Workspace name
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <BriefcaseBusiness size={18} className="text-[#667085]" />
                <input
                  name="workspaceName"
                  type="text"
                  placeholder="Acme QA"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </span>
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#132238] px-5 text-sm font-semibold text-white shadow-lg shadow-[#132238]/20 hover:bg-[#203653]"
            >
              Create account
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
