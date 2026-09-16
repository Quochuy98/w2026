import { NotFoundMascot } from "@/components/wedding/not-found-mascot";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center px-6 py-12 text-center">
      <section className="flex w-full max-w-sm flex-col items-center">
        <NotFoundMascot />
        <p className="mt-9 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          404
        </p>
        <h1 className="mt-3 font-display text-balance text-5xl leading-[1.05] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl">
          Không tìm thấy trang
        </h1>
        <p className="mt-5 max-w-xs text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.
        </p>
      </section>
    </main>
  );
}
