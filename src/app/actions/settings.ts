"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { readUpdateProfileForm, updateProfileSchema } from "@/lib/settings-schemas";
import { updateUserProfile } from "@/lib/local-db";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function updateProfileAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = updateProfileSchema.safeParse(readUpdateProfileForm(formData));

  if (!parsed.success) {
    redirect(`/settings?error=${encodeMessage(parsed.error.issues[0]?.message ?? "Invalid profile details")}`);
  }

  updateUserProfile(session.user.id, {
    name: parsed.data.name,
  });

  redirect("/settings?success=Profile updated");
}
