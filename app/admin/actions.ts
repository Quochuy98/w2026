"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  getAdminSessionCookie,
  getExpiredAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/auth/session";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=invalid");
  }

  const token = createAdminSession();
  const store = await cookies();
  store.set(getAdminSessionCookie(token));
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.set(getExpiredAdminSessionCookie());
  redirect("/admin/login");
}
