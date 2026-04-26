import { z } from "zod";
import { readString } from "@/lib/auth-schemas";

export const createBugSchema = z.object({
  projectId: z.string().min(1, "Select a project"),
  module: z.string().trim().min(2, "Module is required"),
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  severity: z.enum(["MINOR", "MAJOR", "BLOCKER"]),
  environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]),
  stepsToReproduce: z.string().trim().min(10, "Steps to reproduce are required"),
  expectedResult: z.string().trim().min(3, "Expected result is required"),
  actualResult: z.string().trim().min(3, "Actual result is required"),
  browser: z.string().trim().optional(),
  operatingSystem: z.string().trim().optional(),
  device: z.string().trim().optional(),
  appVersion: z.string().trim().optional(),
});

export function readCreateBugForm(formData: FormData) {
  return {
    projectId: readString(formData, "projectId"),
    module: readString(formData, "module"),
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    priority: readString(formData, "priority"),
    severity: readString(formData, "severity"),
    environment: readString(formData, "environment"),
    stepsToReproduce: readString(formData, "stepsToReproduce"),
    expectedResult: readString(formData, "expectedResult"),
    actualResult: readString(formData, "actualResult"),
    browser: readString(formData, "browser") || undefined,
    operatingSystem: readString(formData, "operatingSystem") || undefined,
    device: readString(formData, "device") || undefined,
    appVersion: readString(formData, "appVersion") || undefined,
  };
}

export function slaDueDate(priority: z.infer<typeof createBugSchema>["priority"]) {
  const hoursByPriority = {
    CRITICAL: 24,
    HIGH: 72,
    MEDIUM: 168,
    LOW: 336,
  };

  return new Date(Date.now() + hoursByPriority[priority] * 60 * 60 * 1000);
}

export function suggestPriority(text: string) {
  const normalized = text.toLowerCase();

  const criticalWords = ["payment", "data loss", "security", "breach", "crash", "production", "cannot login"];
  const highWords = ["login", "checkout", "api", "failed", "error", "blocked", "timeout"];
  const mediumWords = ["slow", "incorrect", "missing", "broken", "not working"];

  if (criticalWords.some((word) => normalized.includes(word))) {
    return {
      priority: "CRITICAL",
      reason: "The report mentions business-critical or production-impacting behavior.",
    };
  }

  if (highWords.some((word) => normalized.includes(word))) {
    return {
      priority: "HIGH",
      reason: "The report mentions a blocked workflow, failure, or important feature area.",
    };
  }

  if (mediumWords.some((word) => normalized.includes(word))) {
    return {
      priority: "MEDIUM",
      reason: "The report sounds user-facing but not clearly system-blocking.",
    };
  }

  return {
    priority: "LOW",
    reason: "No high-impact keywords were detected. Adjust manually if needed.",
  };
}
