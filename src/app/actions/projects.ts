"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { createProjectForOwner, projectKeyExists } from "@/lib/local-db";
import { createProjectSchema, readCreateProjectForm } from "@/lib/project-schemas";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function createProjectAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.accountType !== "user") {
    redirect("/admin");
  }

  const parsed = createProjectSchema.safeParse(readCreateProjectForm(formData));

  if (!parsed.success) {
    redirect(`/projects/new?error=${encodeMessage(parsed.error.issues[0]?.message ?? "Invalid project details")}`);
  }

  if (projectKeyExists(parsed.data.key)) {
    redirect(`/projects/new?error=${encodeMessage("That project key is already used")}`);
  }

  createProjectForOwner({
    ownerId: session.user.id,
    name: parsed.data.name,
    key: parsed.data.key,
    description: parsed.data.description,
  });

  redirect("/projects");
}
