import { z } from "zod";
import { readString } from "@/lib/auth-schemas";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

export function readUpdateProfileForm(formData: FormData) {
  return {
    name: readString(formData, "name"),
  };
}
