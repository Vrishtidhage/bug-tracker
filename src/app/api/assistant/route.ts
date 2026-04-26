import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { answerAssistantQuestion } from "@/lib/assistant-engine";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (session.user.accountType !== "user") {
    return NextResponse.json({ error: "User session required" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { question?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, 240) : "";

  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  return NextResponse.json(answerAssistantQuestion(session.user.id, question));
}
