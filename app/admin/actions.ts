"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  getAdminSessionCookie,
  getExpiredAdminSessionCookie,
  getSessionTokenFromCookieHeader,
  verifyAdminPassword,
  verifyAdminSession,
} from "@/lib/auth/session";
import type { WeddingSlot } from "@/content/wedding";

function getCookieHeader(store: Awaited<ReturnType<typeof cookies>>) {
  return store.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
}

async function assertAdmin() {
  const store = await cookies();
  const session = verifyAdminSession(getSessionTokenFromCookieHeader(getCookieHeader(store)));
  if (!session) throw new Error("Phiên quản trị đã hết hạn.");
}

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

export async function assignSlotAction(fileId: string | null, slot: WeddingSlot) {
  await assertAdmin();
  // Keep the Node ImageKit SDK in the server action chunk. Static imports here
  // would make Next include its Node crypto client in the admin browser bundle.
  const { assignAlbumSlot } = await import("@/lib/imagekit/admin");
  await assignAlbumSlot(fileId, slot);
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function refreshAlbumAction() {
  await assertAdmin();
  const { refreshPublicAlbum } = await import("@/lib/imagekit/admin");
  await refreshPublicAlbum();
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}
