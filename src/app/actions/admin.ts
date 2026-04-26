"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { isWorkspaceRole } from "@/lib/authz";
import { countAdmins, findUserById, updateUserWorkspaceRole } from "@/lib/local-db";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function updateWorkspaceRoleAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  if (session.user.accountType !== "admin") {
    redirect("/dashboard");
  }

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (typeof userId !== "string" || typeof role !== "string" || !isWorkspaceRole(role)) {
    redirect(`/admin?error=${encodeMessage("Invalid role update")}`);
  }

  const targetUser = findUserById(userId);

  if (!targetUser) {
    redirect(`/admin?error=${encodeMessage("User not found")}`);
  }

  if (targetUser.workspaceRole === "ADMIN" && role !== "ADMIN" && countAdmins() <= 1) {
    redirect(`/admin?error=${encodeMessage("At least one admin must remain in the workspace")}`);
  }

  updateUserWorkspaceRole(targetUser.id, role);
  redirect("/admin");
}
