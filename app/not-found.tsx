import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { NotFoundMascot } from "@/components/wedding/not-found-mascot";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-[var(--background)] px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
      <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-[1400px] overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] md:min-h-[calc(100dvh-4rem)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
          <p className="font-display text-3xl tracking-[-0.05em] text-[var(--foreground)]">
            H&amp;T
          </p>

          <div className="max-w-md py-12 md:py-0">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              Lỗi 404
            </p>
            <h1 className="font-display text-balance text-5xl leading-[1.04] tracking-[-0.055em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Có lẽ đường dẫn này đã lạc mất
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Tấm thiệp bạn đang tìm không còn ở đây. Hãy trở về trang thiệp cưới của chúng mình nhé.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] active:scale-[0.98]"
            >
              <ArrowLeft size={17} weight="bold" />
              Về trang thiệp cưới
            </Link>
          </div>

          <p className="text-sm text-[var(--muted)]">Quốc Huy &amp; Hoài Thương</p>
        </div>

        <div className="relative min-h-[22rem] overflow-hidden bg-[var(--surface-strong)] md:min-h-0">
          <Image
            src="/og/og-banner.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 100vw, 60vw"
            className="object-cover object-[58%_center]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(36_50_59_/_0.28)_100%)]"
          />
          <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
            <NotFoundMascot />
          </div>
        </div>
      </section>
    </main>
  );
}
