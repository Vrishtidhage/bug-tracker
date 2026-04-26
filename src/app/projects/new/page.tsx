import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, KeyRound, Text } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { createProjectAction } from "@/app/actions/projects";

type NewProjectPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.accountType !== "user") {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-[#227245]">
          <ArrowLeft size={18} />
          Back to projects
        </Link>

        <header className="mt-5 border-b border-[#e1e7f0] pb-6">
          <h1 className="text-3xl font-semibold text-[#101828]">Create project</h1>
          <p className="mt-2 text-sm text-[#667085]">
            Add a product or module workspace for focused bug triage.
          </p>
        </header>

        {params.error ? (
          <p className="mt-6 rounded-md border border-[#fecdca] bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#b42318]">
            {params.error}
          </p>
        ) : null}

        <form action={createProjectAction} className="glass-panel mt-6 grid gap-5 rounded-lg p-5">
          <label className="grid gap-2 text-sm font-medium text-[#344054]">
            Project name
            <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
              <BriefcaseBusiness size={18} className="text-[#667085]" />
              <input
                name="name"
                type="text"
                placeholder="Customer Portal"
                className="w-full bg-transparent text-sm outline-none"
                required
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#344054]">
            Project key
            <span className="flex items-center gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
              <KeyRound size={18} className="text-[#667085]" />
              <input
                name="key"
                type="text"
                placeholder="CP"
                className="w-full bg-transparent text-sm uppercase outline-none"
                maxLength={8}
                required
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#344054]">
            Description
            <span className="flex items-start gap-3 rounded-md border border-[#cad2de] px-3 py-3 focus-within:border-[#4e8cff]">
              <Text size={18} className="mt-1 text-[#667085]" />
              <textarea
                name="description"
                rows={4}
                placeholder="What does this project cover?"
                className="w-full bg-transparent text-sm outline-none"
              />
            </span>
          </label>

          <div className="flex flex-col gap-3 border-t border-[#edf0f5] pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/projects"
              className="inline-flex h-11 items-center justify-center rounded-md border border-[#cad2de] px-4 text-sm font-semibold text-[#344054]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#132238] px-4 text-sm font-semibold text-white hover:bg-[#203653]"
            >
              Create project
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
