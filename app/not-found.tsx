import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { NotFoundMascot } from "@/components/wedding/not-found-mascot";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center px-6 py-12 text-center">
      <section className="flex w-full max-w-sm flex-col items-center">
        <NotFoundMascot />
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          404
        </p>
        <h1 className="mt-3 font-display text-balance text-5xl leading-[1.05] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl">
          Không tìm thấy trang
        </h1>
        <p className="mt-5 max-w-xs text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] active:scale-[0.98]"
        >
          <ArrowLeft size={17} weight="bold" />
          Quay về trang chủ
        </Link>
      </section>
    </main>
  );
}
