"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { canCreateBugs, canUpdateBugs } from "@/lib/authz";
import { createBugSchema, readCreateBugForm, slaDueDate } from "@/lib/bug-schemas";
import {
  addBugComment,
  countProjectBugs,
  createBug,
  findUserById,
  getSystemAdminActorId,
  getBugForUser,
  updateBugWorkflow,
  userCanAccessProject,
} from "@/lib/local-db";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function encodeValue(value: FormDataEntryValue | null) {
  return encodeURIComponent(typeof value === "string" ? value : "");
}

export async function checkBugHintsAction(formData: FormData) {
  const params = new URLSearchParams({
    hints: "1",
    projectId: typeof formData.get("projectId") === "string" ? String(formData.get("projectId")) : "",
    module: typeof formData.get("module") === "string" ? String(formData.get("module")) : "",
    title: typeof formData.get("title") === "string" ? String(formData.get("title")) : "",
    description: typeof formData.get("description") === "string" ? String(formData.get("description")) : "",
    priority: typeof formData.get("priority") === "string" ? String(formData.get("priority")) : "MEDIUM",
    severity: typeof formData.get("severity") === "string" ? String(formData.get("severity")) : "MAJOR",
    environment: typeof formData.get("environment") === "string" ? String(formData.get("environment")) : "STAGING",
    stepsToReproduce: encodeValue(formData.get("stepsToReproduce")),
    expectedResult: encodeValue(formData.get("expectedResult")),
    actualResult: encodeValue(formData.get("actualResult")),
    browser: encodeValue(formData.get("browser")),
    operatingSystem: encodeValue(formData.get("operatingSystem")),
    device: encodeValue(formData.get("device")),
    appVersion: encodeValue(formData.get("appVersion")),
  });

  redirect(`/bugs/new?${params.toString()}`);
}

export async function createBugAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUser = findUserById(session.user.id);
  const effectiveRole = currentUser?.workspaceRole ?? session.user.role;

  if (!canCreateBugs(effectiveRole)) {
    redirect(`/bugs/new?error=${encodeMessage("Your role can view bugs but cannot create them")}`);
  }

  const parsed = createBugSchema.safeParse(readCreateBugForm(formData));

  if (!parsed.success) {
    redirect(`/bugs/new?error=${encodeMessage(parsed.error.issues[0]?.message ?? "Invalid bug details")}`);
  }

  const membership = userCanAccessProject(session.user.id, parsed.data.projectId);

  if (!membership) {
    redirect(`/bugs/new?error=${encodeMessage("You do not have access to that project")}`);
  }

  const projectBugCount = countProjectBugs(parsed.data.projectId);

  const bugKey = `${membership.key}-${String(projectBugCount + 1).padStart(3, "0")}`;

  createBug({
    bugKey,
    title: parsed.data.title,
    description: parsed.data.description,
    stepsToReproduce: parsed.data.stepsToReproduce,
    expectedResult: parsed.data.expectedResult,
    actualResult: parsed.data.actualResult,
    module: parsed.data.module,
    browser: parsed.data.browser,
    operatingSystem: parsed.data.operatingSystem,
    device: parsed.data.device,
    appVersion: parsed.data.appVersion,
    environment: parsed.data.environment,
    priority: parsed.data.priority,
    severity: parsed.data.severity,
    slaDueAt: slaDueDate(parsed.data.priority),
    projectId: parsed.data.projectId,
    reporterId: session.user.accountType === "admin" ? getSystemAdminActorId() : session.user.id,
  });

  redirect("/bugs");
}

export async function updateBugWorkflowAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUser = findUserById(session.user.id);
  const effectiveRole = currentUser?.workspaceRole ?? session.user.role;

  if (!canUpdateBugs(effectiveRole)) {
    redirect("/bugs");
  }

  const bugId = formData.get("bugId");
  const status = formData.get("status");
  const assigneeId = formData.get("assigneeId");

  if (typeof bugId !== "string" || typeof status !== "string") {
    redirect("/bugs");
  }

  const bug = getBugForUser(session.user.id, bugId);

  if (!bug) {
    redirect("/bugs");
  }

  updateBugWorkflow({
    bugId,
    actorId: session.user.accountType === "admin" ? getSystemAdminActorId() : session.user.id,
    status,
    assigneeId: typeof assigneeId === "string" && assigneeId.length > 0 ? assigneeId : null,
  });

  redirect(`/bugs/${bugId}`);
}

export async function addBugCommentAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUser = findUserById(session.user.id);
  const effectiveRole = currentUser?.workspaceRole ?? session.user.role;

  if (!canUpdateBugs(effectiveRole)) {
    redirect("/bugs");
  }

  const bugId = formData.get("bugId");
  const body = formData.get("body");

  if (typeof bugId !== "string" || typeof body !== "string") {
    redirect("/bugs");
  }

  const trimmedBody = body.trim();

  if (trimmedBody.length < 2) {
    redirect(`/bugs/${bugId}`);
  }

  const bug = getBugForUser(session.user.id, bugId);

  if (!bug) {
    redirect("/bugs");
  }

  addBugComment({
    bugId,
    authorId: session.user.accountType === "admin" ? getSystemAdminActorId() : session.user.id,
    body: trimmedBody,
  });

  redirect(`/bugs/${bugId}`);
}
