import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginAction } from "../actions";
import { getSessionTokenFromCookieHeader, verifyAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị | Quốc Huy & Hoài Thương",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const store = await cookies();
  const cookieHeader = store.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
  if (verifyAdminSession(getSessionTokenFromCookieHeader(cookieHeader))) redirect("/admin");
  const params = await searchParams;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)]/70 p-7 sm:p-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">H&amp;T album</p>

        <h1 className="mt-4 font-display text-4xl tracking-[-0.04em]">Quản lý album</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">Đăng nhập để tải ảnh và chọn các vị trí nổi bật trên trang cưới.</p>
        {params?.error === "invalid" && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">Mật khẩu chưa đúng.</p>}
        <form action={loginAction} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold" htmlFor="password">Mật khẩu quản trị</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 block min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 text-[var(--foreground)] placeholder:text-[var(--muted)]" placeholder="Nhập mật khẩu" />
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:bg-[var(--accent-strong)] active:scale-[0.98]">Đăng nhập</button>
        </form>
      </section>
    </main>
  );
}
