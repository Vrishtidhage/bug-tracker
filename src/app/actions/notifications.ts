"use server";

import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/local-db";

export async function markNotificationReadAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notificationId = formData.get("notificationId");
  const href = formData.get("href");

  if (typeof notificationId === "string") {
    markNotificationRead(session.user.id, notificationId);
  }

  if (typeof href === "string" && href.startsWith("/")) {
    redirect(href);
  }

  redirect("/notifications");
}

export async function markAllNotificationsReadAction() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  markAllNotificationsRead(session.user.id);
  redirect("/notifications");
}
