"use client";

import Link from "next/link";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { FormEvent, useState } from "react";

type AssistantReply = {
  title: string;
  content: string;
  links: Array<{ label: string; href: string }>;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  reply?: AssistantReply;
};

const quickPrompts = ["Critical bugs", "SLA risk", "Team workload"];

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Ask me about critical bugs, SLA pressure, project health, or what to work on first.",
    },
  ]);

  async function askAssistant(nextQuestion: string) {
    const trimmed = nextQuestion.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setQuestion("");
    setIsLoading(true);
    setMessages((current) => [...current, { role: "user", text: trimmed }]);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Assistant request failed");
      }

      const reply = (await response.json()) as AssistantReply;
      setMessages((current) => [...current, { role: "assistant", text: reply.content, reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I could not answer that securely right now. Please check your session and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askAssistant(question);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <section className="w-[min(calc(100vw-2.5rem),390px)] overflow-hidden rounded-lg border border-[#d9e0ea] bg-white shadow-[0_18px_55px_rgba(16,24,40,0.18)]">
          <header className="flex items-center justify-between border-b border-[#edf0f5] bg-[#132238] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-white/12">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">Bug Assistant</p>
                <p className="text-xs text-white/75">Authenticated workspace AI</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              onClick={() => setIsOpen(false)}
              className="flex size-9 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </header>

          <div className="max-h-[420px] overflow-y-auto bg-[#f7f8fb] p-4">
            <div className="grid gap-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-auto bg-[#132238] text-white"
                      : "mr-auto border border-[#e1e7f0] bg-white text-[#344054]"
                  }`}
                >
                  {message.reply?.title ? (
                    <p className="mb-1 font-semibold text-[#101828]">{message.reply.title}</p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.reply?.links?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.reply.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-md border border-[#cad2de] px-2 py-1 text-xs font-semibold text-[#175cd3] hover:border-[#9eabbc]"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {isLoading ? (
                <div className="mr-auto flex items-center gap-2 rounded-lg border border-[#e1e7f0] bg-white px-3 py-2 text-sm text-[#667085]">
                  <Loader2 className="animate-spin" size={16} />
                  Thinking
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-[#edf0f5] bg-white p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void askAssistant(prompt)}
                  className="rounded-md border border-[#cad2de] px-2 py-1 text-xs font-semibold text-[#344054] hover:border-[#9eabbc]"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={240}
                placeholder="Ask about bugs, risk, team..."
                className="h-11 min-w-0 flex-1 rounded-md border border-[#cad2de] px-3 text-sm outline-none focus:border-[#4e8cff]"
              />
              <button
                type="submit"
                disabled={isLoading || question.trim().length === 0}
                aria-label="Send message"
                className="flex size-11 items-center justify-center rounded-md bg-[#132238] text-white hover:bg-[#203653] disabled:cursor-not-allowed disabled:bg-[#98a2b3]"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        aria-label="Open assistant"
        onClick={() => setIsOpen((current) => !current)}
        className="flex size-14 items-center justify-center rounded-full bg-[#132238] text-white shadow-[0_14px_35px_rgba(16,24,40,0.24)] hover:bg-[#203653]"
      >
        <Bot size={24} />
      </button>
    </div>
  );
}
