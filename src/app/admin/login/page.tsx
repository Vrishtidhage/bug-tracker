import Link from "next/link";
import { ArrowRight, Bug, Lock, Mail, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { adminLoginAction } from "@/app/actions/auth";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await auth();

  if (session?.user?.accountType === "admin") {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-[#f4f7fb] text-[#172033] lg:grid-cols-[0.85fr_1.15fr]">
      <section className="pro-admin flex flex-col justify-between px-6 py-8 text-white sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-white text-[#101828]">
            <Bug size={22} />
          </span>
          <span className="text-lg font-semibold">E-Bug Tracker</span>
        </Link>
        <div className="dark-glass my-12 max-w-lg rounded-lg p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9be7b0]">Admin access</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">Separate control console.</h1>
          <p className="mt-5 text-base leading-7 text-[#d8e1ef]">
            Admin login is isolated from user accounts and controls workspace roles, assignment, reports, and system
            oversight.
          </p>
        </div>
        <Link href="/login" className="text-sm font-semibold text-[#d8e1ef] hover:text-white">
          User login
        </Link>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="glass-panel w-full max-w-md rounded-lg p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-[#132238] text-white">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-[#101828]">Admin login</h2>
              <p className="mt-1 text-sm text-[#667085]">Use the protected admin credentials.</p>
            </div>
          </div>

          {params.error ? (
            <p className="mt-6 rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
              {params.error}
            </p>
          ) : null}

          <form action={adminLoginAction} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Admin email
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <Mail size={18} className="text-[#667085]" />
                <input name="email" type="email" className="w-full bg-transparent text-sm outline-none" required />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#344054]">
              Admin password
              <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
                <Lock size={18} className="text-[#667085]" />
                <input name="password" type="password" className="w-full bg-transparent text-sm outline-none" required />
              </span>
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#132238] px-5 text-sm font-semibold text-white shadow-lg shadow-[#132238]/20 hover:bg-[#203653]"
            >
              Enter admin console
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
