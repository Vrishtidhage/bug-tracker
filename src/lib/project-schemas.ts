import { z } from "zod";
import { readString } from "@/lib/auth-schemas";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters"),
  key: z
    .string()
    .trim()
    .min(2, "Project key must be at least 2 characters")
    .max(8, "Project key must be 8 characters or less")
    .regex(/^[A-Za-z0-9]+$/, "Project key can only use letters and numbers")
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().optional(),
});

export function readCreateProjectForm(formData: FormData) {
  return {
    name: readString(formData, "name"),
    key: readString(formData, "key"),
    description: readString(formData, "description") || undefined,
  };
}
