import { z } from "zod";
import { readString } from "@/lib/auth-schemas";

export const addTeamMemberSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  projectId: z.string().min(1, "Select a project"),
  role: z.enum(["MANAGER", "DEVELOPER", "TESTER", "VIEWER"]),
});

export function readAddTeamMemberForm(formData: FormData) {
  return {
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    projectId: readString(formData, "projectId"),
    role: readString(formData, "role"),
  };
}
