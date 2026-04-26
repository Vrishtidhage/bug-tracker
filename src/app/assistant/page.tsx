import Link from "next/link";
import { Bot, Bug, Lightbulb, Send, Sparkles, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { askAssistantAction } from "@/app/actions/assistant";
import { getAssistantSuggestions } from "@/lib/assistant-engine";

type AssistantPageProps = {
  searchParams: Promise<{
    q?: string;
    title?: string;
    answer?: string;
    links?: string;
  }>;
};

function parseLinks(value?: string) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Array<{ label: string; href: string }>;
    return parsed.filter((link) => link.label && link.href && link.href.startsWith("/"));
  } catch {
    return [];
  }
}

export default async function AssistantPage({ searchParams }: AssistantPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const suggestions = getAssistantSuggestions();
  const links = parseLinks(params.links);

  return (
    <main className="pro-app min-h-screen px-5 py-6 text-[#172033] sm:px-8">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-b border-[#e1e7f0] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 text-sm font-semibold text-[#227245]">
            <Bug size={18} />
            Dashboard
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-[#132238] text-white">
              <Bot size={23} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-[#101828]">AI Assistant</h1>
              <p className="mt-1 text-sm text-[#667085]">
                Authenticated assistant connected to your project, bug, team, and report data.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#d7e2dc] bg-white px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#227245]">
            <Sparkles size={18} />
            Local intelligence active
          </p>
          <p className="mt-1 text-xs text-[#667085]">Ready for OpenAI upgrade later.</p>
        </div>
      </header>

      <section className="mx-auto mt-6 grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="glass-panel rounded-lg">
          <div className="border-b border-[#edf0f5] p-5">
            <h2 className="text-lg font-semibold text-[#101828]">Chat</h2>
            <p className="mt-1 text-sm text-[#667085]">
              Ask for priorities, risky projects, SLA pressure, workload, or a weekly summary.
            </p>
          </div>

          <div className="grid min-h-[420px] content-start gap-5 p-5">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#eef7f1] text-[#227245]">
                <Bot size={18} />
              </span>
              <div className="max-w-2xl rounded-lg bg-[#f7f8fb] p-4">
                <p className="text-sm leading-6 text-[#536173]">
                  I can answer from your tracker data. Try asking what to work on first, which project is risky, or
                  whether there are overdue SLA items.
                </p>
              </div>
            </div>

            {params.q ? (
              <div className="flex justify-end gap-3">
                <div className="max-w-2xl rounded-lg bg-[#132238] p-4 text-white">
                  <p className="text-sm leading-6">{params.q}</p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-[#536173]">
                  <UserRound size={18} />
                </span>
              </div>
            ) : null}

            {params.answer ? (
              <div className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#eef7f1] text-[#227245]">
                  <Bot size={18} />
                </span>
                <div className="max-w-2xl rounded-lg bg-[#f7f8fb] p-4">
                  <p className="text-sm font-semibold text-[#101828]">{params.title ?? "Assistant answer"}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#536173]">{params.answer}</p>
                  {links.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-md border border-[#cad2de] bg-white px-3 py-2 text-xs font-semibold text-[#344054] hover:border-[#9eabbc]"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <form action={askAssistantAction} className="flex flex-col gap-3 border-t border-[#edf0f5] p-5 sm:flex-row">
            <input
              name="question"
              type="text"
              placeholder="Ask: What should I work on first?"
              className="h-12 flex-1 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]"
              required
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#132238] px-5 text-sm font-semibold text-white hover:bg-[#203653]"
            >
              <Send size={18} />
              Ask
            </button>
          </form>
        </div>

        <aside className="grid gap-6">
          <section className="glass-panel rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Lightbulb className="text-[#f79009]" size={20} />
              <h2 className="text-lg font-semibold text-[#101828]">Quick prompts</h2>
            </div>
            <div className="mt-5 grid gap-2">
              {suggestions.map((suggestion) => (
                <form key={suggestion} action={askAssistantAction}>
                  <input type="hidden" name="question" value={suggestion} />
                  <button
                    type="submit"
                    className="w-full rounded-md border border-[#edf0f5] bg-[#fbfcfe] px-3 py-3 text-left text-sm font-semibold text-[#344054] hover:border-[#cad2de]"
                  >
                    {suggestion}
                  </button>
                </form>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-lg p-5">
            <h2 className="text-lg font-semibold text-[#101828]">Integration</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[#667085]">
              <p>Uses authenticated session data only.</p>
              <p>Reads local bug, project, team, SLA, and report data.</p>
              <p>Can be upgraded to real LLM responses without changing the route flow.</p>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
