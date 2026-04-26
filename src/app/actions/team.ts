"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { canManageTeam } from "@/lib/authz";
import { addOrCreateProjectMember, findUserById, userCanAccessProject } from "@/lib/local-db";
import { addTeamMemberSchema, readAddTeamMemberForm } from "@/lib/team-schemas";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function addTeamMemberAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUser = findUserById(session.user.id);
  const effectiveRole = currentUser?.workspaceRole ?? session.user.role;

  if (!canManageTeam(effectiveRole)) {
    redirect(`/team?error=${encodeMessage("Only admins and managers can manage teammates")}`);
  }

  const parsed = addTeamMemberSchema.safeParse(readAddTeamMemberForm(formData));

  if (!parsed.success) {
    redirect(`/team?error=${encodeMessage(parsed.error.issues[0]?.message ?? "Invalid teammate details")}`);
  }

  const projectAccess = userCanAccessProject(session.user.id, parsed.data.projectId);

  if (!projectAccess) {
    redirect(`/team?error=${encodeMessage("You do not have access to that project")}`);
  }

  addOrCreateProjectMember({
    name: parsed.data.name,
    email: parsed.data.email,
    projectId: parsed.data.projectId,
    role: parsed.data.role,
  });

  redirect("/team");
}
