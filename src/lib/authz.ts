export const workspaceRoles = ["ADMIN", "MANAGER", "DEVELOPER", "TESTER", "VIEWER"] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

export function isWorkspaceRole(role: string | null | undefined): role is WorkspaceRole {
  return Boolean(role && workspaceRoles.includes(role as WorkspaceRole));
}

export function canAccessAdmin(role: string | null | undefined) {
  return role === "ADMIN";
}

export function canManageProjects(role: string | null | undefined) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canManageTeam(role: string | null | undefined) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canViewReports(role: string | null | undefined) {
  return role === "ADMIN" || role === "MANAGER";
}

export function canCreateBugs(role: string | null | undefined) {
  return role === "ADMIN" || role === "MANAGER" || role === "DEVELOPER" || role === "TESTER";
}

export function canUpdateBugs(role: string | null | undefined) {
  return role === "ADMIN" || role === "MANAGER" || role === "DEVELOPER" || role === "TESTER";
}

export function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
