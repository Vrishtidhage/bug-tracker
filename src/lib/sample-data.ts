export type BugPriority = "Low" | "Medium" | "High" | "Critical";
export type BugStatus = "Open" | "Triaged" | "In Progress" | "QA Verify" | "Resolved" | "Closed";

export type BugSummary = {
  key: string;
  title: string;
  module: string;
  status: BugStatus;
  priority: BugPriority;
  assignee: string;
  project: string;
  sla: string;
};

export type ProjectSummary = {
  key: string;
  name: string;
  owner: string;
  openBugs: number;
  criticalBugs: number;
  members: number;
  health: "Healthy" | "Watch" | "At Risk";
};

export const projects: ProjectSummary[] = [
  {
    key: "CP",
    name: "Customer Portal",
    owner: "Mira Shah",
    openBugs: 42,
    criticalBugs: 7,
    members: 9,
    health: "At Risk",
  },
  {
    key: "PAY",
    name: "Payment Gateway",
    owner: "Aarav Mehta",
    openBugs: 18,
    criticalBugs: 3,
    members: 6,
    health: "Watch",
  },
  {
    key: "ADM",
    name: "Admin Console",
    owner: "Neha Iyer",
    openBugs: 11,
    criticalBugs: 0,
    members: 5,
    health: "Healthy",
  },
];

export const bugs: BugSummary[] = [
  {
    key: "CP-104",
    title: "Payment callback fails after retry",
    module: "Checkout",
    status: "Open",
    priority: "Critical",
    assignee: "Mira Shah",
    project: "Customer Portal",
    sla: "2h left",
  },
  {
    key: "CP-118",
    title: "Login page freezes on mobile Safari",
    module: "Authentication",
    status: "In Progress",
    priority: "High",
    assignee: "Aarav Mehta",
    project: "Customer Portal",
    sla: "1d left",
  },
  {
    key: "PAY-077",
    title: "Refund webhook is processed twice",
    module: "Webhooks",
    status: "Triaged",
    priority: "High",
    assignee: "Neha Iyer",
    project: "Payment Gateway",
    sla: "8h left",
  },
  {
    key: "ADM-031",
    title: "Audit export misses role updates",
    module: "Audit Logs",
    status: "QA Verify",
    priority: "Medium",
    assignee: "Rohan Das",
    project: "Admin Console",
    sla: "3d left",
  },
  {
    key: "CP-125",
    title: "Profile image crop loses transparency",
    module: "Profile",
    status: "Resolved",
    priority: "Medium",
    assignee: "Mira Shah",
    project: "Customer Portal",
    sla: "Met",
  },
];

export const dashboardStats = [
  { label: "Open bugs", value: bugs.filter((bug) => bug.status !== "Closed").length.toString() },
  { label: "Critical", value: bugs.filter((bug) => bug.priority === "Critical").length.toString() },
  { label: "In progress", value: bugs.filter((bug) => bug.status === "In Progress").length.toString() },
  { label: "Resolved", value: bugs.filter((bug) => bug.status === "Resolved").length.toString() },
];

export const kanbanColumns = [
  { title: "Open", bugs: bugs.filter((bug) => bug.status === "Open") },
  { title: "Triaged", bugs: bugs.filter((bug) => bug.status === "Triaged") },
  { title: "In Progress", bugs: bugs.filter((bug) => bug.status === "In Progress") },
  { title: "QA Verify", bugs: bugs.filter((bug) => bug.status === "QA Verify" || bug.status === "Resolved") },
];

export function priorityClass(priority: BugPriority) {
  const colors: Record<BugPriority, string> = {
    Low: "bg-[#e8f4ff] text-[#175cd3]",
    Medium: "bg-[#eef7f1] text-[#227245]",
    High: "bg-[#fff4e5] text-[#b54708]",
    Critical: "bg-[#fff0ef] text-[#b42318]",
  };

  return colors[priority];
}

export function healthClass(health: ProjectSummary["health"]) {
  const colors: Record<ProjectSummary["health"], string> = {
    Healthy: "bg-[#eef7f1] text-[#227245]",
    Watch: "bg-[#fff4e5] text-[#b54708]",
    "At Risk": "bg-[#fff0ef] text-[#b42318]",
  };

  return colors[health];
}
