"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn, signOut } from "../../../auth";
import { readString, loginSchema, registerSchema } from "@/lib/auth-schemas";
import { createUserWithProject, findUserByEmail } from "@/lib/local-db";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function configuredAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? "vrishtidhage@gmail.com").toLowerCase();
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: readString(formData, "email"),
    password: readString(formData, "password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeMessage(parsed.error.issues[0]?.message ?? "Invalid login details")}`);
  }

  if (parsed.data.email === configuredAdminEmail()) {
    redirect(`/login?error=${encodeMessage("Use the separate admin login for this email")}`);
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=${encodeMessage("Invalid email or password")}`);
    }

    throw error;
  }
}

export async function adminLoginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: readString(formData, "email"),
    password: readString(formData, "password"),
  });

  if (!parsed.success) {
    redirect(`/admin/login?error=${encodeMessage(parsed.error.issues[0]?.message ?? "Invalid admin login details")}`);
  }

  try {
    await signIn("admin-credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/admin/login?error=${encodeMessage("Invalid admin email or password")}`);
    }

    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
    workspaceName: readString(formData, "workspaceName"),
  });

  if (!parsed.success) {
    redirect(`/register?error=${encodeMessage(parsed.error.issues[0]?.message ?? "Invalid registration details")}`);
  }

  if (parsed.data.email === configuredAdminEmail()) {
    redirect(`/register?error=${encodeMessage("This email is reserved for the admin console")}`);
  }

  const existingUser = findUserByEmail(parsed.data.email);

  if (existingUser) {
    redirect(`/register?error=${encodeMessage("An account already exists for this email")}`);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  createUserWithProject({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    workspaceName: parsed.data.workspaceName,
  });

  redirect("/login?registered=1");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
