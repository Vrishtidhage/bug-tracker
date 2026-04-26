import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  workspaceName: z.string().trim().min(2, "Workspace name must be at least 2 characters"),
});

export function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
