"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { answerAssistantQuestion } from "@/lib/assistant-engine";

export async function askAssistantAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const question = formData.get("question");

  if (typeof question !== "string") {
    redirect("/assistant");
  }

  const answer = answerAssistantQuestion(session.user.id, question);
  const params = new URLSearchParams({
    q: question,
    title: answer.title,
    answer: answer.content,
    links: JSON.stringify(answer.links),
  });

  redirect(`/assistant?${params.toString()}`);
}
