import {
  getDashboardSnapshot,
  getReportSnapshot,
  listBugsForUser,
  listProjectsForUser,
  listTeamMembersForUser,
} from "@/lib/local-db";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantAnswer = {
  title: string;
  content: string;
  links: Array<{ label: string; href: string }>;
};

const suggestions = [
  "What should I work on first?",
  "Show critical bugs",
  "Which project is most risky?",
  "Summarize team workload",
  "Show overdue SLA items",
  "Give me a weekly report",
];

function normalize(input: string) {
  return input.trim().toLowerCase();
}

function formatBugLine(bug: ReturnType<typeof listBugsForUser>[number]) {
  return `${bug.bugKey}: ${bug.title} (${bug.project}, ${bug.status.replaceAll("_", " ")})`;
}

export function getAssistantSuggestions() {
  return suggestions;
}

export function answerAssistantQuestion(userId: string, question: string): AssistantAnswer {
  const normalized = normalize(question);
  const bugs = listBugsForUser(userId);
  const projects = listProjectsForUser(userId);
  const team = listTeamMembersForUser(userId);
  const report = getReportSnapshot(userId);
  const dashboard = getDashboardSnapshot(userId);

  if (!normalized) {
    return {
      title: "Ask about your tracker",
      content: `Try asking: ${suggestions.slice(0, 3).join(", ")}.`,
      links: [{ label: "Open dashboard", href: "/dashboard" }],
    };
  }

  if (normalized.includes("critical") || normalized.includes("urgent")) {
    const critical = bugs.filter((bug) => bug.priority === "CRITICAL" && bug.status !== "CLOSED");
    return {
      title: "Critical bugs",
      content:
        critical.length > 0
          ? critical.map(formatBugLine).join("\n")
          : "There are no active critical bugs right now.",
      links: [{ label: "View critical bugs", href: "/bugs?status=OPEN&q=critical" }],
    };
  }

  if (normalized.includes("overdue") || normalized.includes("sla")) {
    const overdue = bugs.filter(
      (bug) => bug.slaDueAt && bug.status !== "CLOSED" && new Date(bug.slaDueAt).getTime() < Date.now(),
    );
    const upcoming = dashboard.slaWatch;
    return {
      title: overdue.length > 0 ? "Overdue SLA items" : "Upcoming SLA watch",
      content:
        overdue.length > 0
          ? overdue.map(formatBugLine).join("\n")
          : upcoming.length > 0
            ? upcoming.map(formatBugLine).join("\n")
            : "No overdue or upcoming SLA pressure found.",
      links: [{ label: "Open reports", href: "/reports" }],
    };
  }

  if (normalized.includes("risky") || normalized.includes("risk") || normalized.includes("health")) {
    const risky = report.projectRows
      .slice()
      .sort((a, b) => b.criticalBugs - a.criticalBugs || b.openBugs - a.openBugs)
      .at(0);

    return {
      title: "Project risk",
      content: risky
        ? `${risky.name} looks most risky: ${risky.openBugs ?? 0} open bugs, ${risky.criticalBugs ?? 0} active critical bugs, ${risky.totalBugs ?? 0} total bugs.`
        : "No project risk data yet. Create projects and bugs to generate a health signal.",
      links: [
        { label: "Open projects", href: "/projects" },
        { label: "Open reports", href: "/reports" },
      ],
    };
  }

  if (normalized.includes("workload") || normalized.includes("team") || normalized.includes("assignee")) {
    const workload = dashboard.workload;
    return {
      title: "Team workload",
      content:
        workload.length > 0
          ? workload.map((row) => `${row.name}: ${row.count} active bugs`).join("\n")
          : `There are ${team.length} project memberships, but no active assigned bugs yet.`,
      links: [{ label: "Open team", href: "/team" }],
    };
  }

  if (normalized.includes("weekly") || normalized.includes("report") || normalized.includes("summary")) {
    const closureRate = report.totals.bugs > 0 ? Math.round((report.totals.closed / report.totals.bugs) * 100) : 0;
    return {
      title: "Tracker summary",
      content: `Projects: ${report.totals.projects}
Total bugs: ${report.totals.bugs}
Open bugs: ${report.totals.open}
Closed bugs: ${report.totals.closed}
Active critical: ${report.totals.critical}
Overdue SLA: ${report.totals.overdue}
Closure rate: ${closureRate}%`,
      links: [{ label: "Open reports", href: "/reports" }],
    };
  }

  if (normalized.includes("first") || normalized.includes("priority") || normalized.includes("work on")) {
    const ranked = bugs
      .filter((bug) => bug.status !== "CLOSED")
      .sort((a, b) => {
        const priorityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const priorityDelta = (priorityWeight[b.priority] ?? 0) - (priorityWeight[a.priority] ?? 0);
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(a.slaDueAt ?? 0).getTime() - new Date(b.slaDueAt ?? 0).getTime();
      })
      .slice(0, 5);

    return {
      title: "Recommended focus",
      content:
        ranked.length > 0
          ? ranked.map((bug, index) => `${index + 1}. ${formatBugLine(bug)}`).join("\n")
          : "There are no active bugs to prioritize.",
      links: [{ label: "Open bugs", href: "/bugs" }],
    };
  }

  if (normalized.includes("project")) {
    return {
      title: "Project overview",
      content:
        projects.length > 0
          ? projects
              .map(
                (project) =>
                  `${project.key}: ${project.name} (${project.openBugs ?? 0} open, ${project.criticalBugs ?? 0} critical)`,
              )
              .join("\n")
          : "No projects found yet.",
      links: [{ label: "Open projects", href: "/projects" }],
    };
  }

  return {
    title: "Assistant answer",
    content:
      "I can help with critical bugs, SLA risk, project health, team workload, weekly reports, and what to work on first.",
    links: [
      { label: "Open bugs", href: "/bugs" },
      { label: "Open reports", href: "/reports" },
    ],
  };
}
