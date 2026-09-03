"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { weddingConfig, type AlbumImage, type GuestInfo, type WeddingSlot } from "@/content/wedding";
import { AlbumImageView } from "./album-image";
import { useWeddingReducedMotion } from "./use-reduced-motion";
import { EnvelopeSimpleOpen, Sparkle, Heart } from "@phosphor-icons/react";

interface InvitationHeroProps {
  slots: Record<WeddingSlot, AlbumImage>;
  guest?: GuestInfo | null;
}

export function InvitationHero({ slots, guest }: InvitationHeroProps) {
  const ready = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const reduce = useWeddingReducedMotion();
  const animated = ready && !reduce;

  // Easing mượt mà như trình chiếu phim
  const slideEase = [0.16, 1, 0.3, 1] as const;

  // Câu chào mời khách
  const invitationHeadline = guest ? (
    <div className="mb-6 inline-flex flex-col items-start gap-1.5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface-strong)]/85 px-5 py-3.5 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
        <EnvelopeSimpleOpen size={14} weight="fill" className="text-[var(--accent)]" />
        <span>Thiệp Mời Cá Nhân Hóa</span>
      </div>
      <p className="font-display text-xl sm:text-2xl text-[var(--foreground)] tracking-[-0.02em]">
        Trân trọng kính mời:{" "}
        <span className="text-[var(--accent-strong)] font-semibold">
          {guest.salutation} {guest.name}
        </span>
      </p>
      {guest.note && (
        <p className="text-xs italic text-[var(--muted)]">{guest.note}</p>
      )}
    </div>
  ) : (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/70 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.25em] text-[var(--accent-strong)] backdrop-blur-sm">
      <Sparkle size={13} weight="fill" className="text-[var(--accent)]" />
      <span>Trân trọng kính mời Quý khách & Gia đình</span>
    </div>
  );

  return (
    <section id="top" className="relative isolate min-h-[100dvh] overflow-hidden bg-[var(--surface-strong)]">
      {/* Background Hero Image - Animation trượt từ dưới lên */}
      <motion.div
        className="absolute inset-0"
        initial={animated ? { y: 90, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={animated ? { duration: 1.2, ease: slideEase } : { duration: 0 }}
      >
        <AlbumImageView
          image={slots.hero}
          priority
          sizes="100vw"
          className="h-full min-h-[100dvh] !rounded-none [&>img]:object-[54%_28%] sm:[&>img]:object-[50%_22%]"
        />
        {/* Subtle Luxury Gradient Overlay */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(244_247_248_/_0.92)_0%,rgb(244_247_248_/_0.65)_40%,rgb(244_247_248_/_0.15)_75%),linear-gradient(0deg,rgb(36_50_59_/_0.2)_0%,transparent_50%)] sm:bg-[linear-gradient(90deg,rgb(244_247_248_/_0.93)_0%,rgb(244_247_248_/_0.72)_38%,rgb(244_247_248_/_0.25)_65%,rgb(244_247_248_/_0.06)_100%),linear-gradient(0deg,rgb(36_50_59_/_0.15)_0%,transparent_50%)]"
        />
      </motion.div>

      {/* Top Monogram Header [H&T] - Chạy từ bên TRÁI vào */}
      <header className="absolute inset-x-0 top-0 z-[2]">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <motion.a
            href="#top"
            className="font-display text-2xl tracking-[-0.04em] text-[var(--foreground)] transition-opacity hover:opacity-80 inline-block"
            aria-label="Về đầu trang"
            initial={animated ? { x: -80, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            transition={animated ? { duration: 0.8, delay: 0.1, ease: slideEase } : { duration: 0 }}
          >
            {weddingConfig.monogram}
          </motion.a>
        </div>
      </header>

      {/* Main Content Hero - Trình chiếu chạy từ 2 bên vào */}
      <div className="relative z-[1] mx-auto flex min-h-[100dvh] w-full max-w-[1400px] items-center px-5 pt-20 pb-16 sm:px-8 sm:pt-24 lg:px-12">
        <div className="max-w-[46rem] overflow-visible">
          {/* Trân trọng kính mời Quý khách & Gia đình - Chạy từ bên TRÁI vào */}
          <motion.div
            initial={animated ? { x: -90, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            transition={animated ? { duration: 0.85, delay: 0.25, ease: slideEase } : { duration: 0 }}
          >
            {invitationHeadline}
          </motion.div>

          {/* Wedding Invitation - Chạy từ bên PHẢI vào */}
          <motion.p
            className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]"
            initial={animated ? { x: 90, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            transition={animated ? { duration: 0.85, delay: 0.4, ease: slideEase } : { duration: 0 }}
          >
            Wedding Invitation
          </motion.p>

          {/* Tên Chú rể & Cô dâu - Chạy từ 2 bên vào gặp nhau */}
          <h1 className="font-display max-w-none pb-2 text-[clamp(2.8rem,7.5vw,6.5rem)] leading-[1.04] tracking-[-0.055em] text-[var(--foreground)] sm:text-[clamp(3.75rem,7vw,6.5rem)] overflow-hidden">
            {/* Quốc Huy - Chạy từ bên TRÁI vào */}
            <motion.span
              className="block"
              initial={animated ? { x: -110, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={animated ? { duration: 0.9, delay: 0.55, ease: slideEase } : { duration: 0 }}
            >
              {weddingConfig.groom}
            </motion.span>
            {/* & Hoài Thương - Chạy từ bên PHẢI vào */}
            <motion.span
              className="block italic font-light"
              initial={animated ? { x: 110, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={animated ? { duration: 0.9, delay: 0.7, ease: slideEase } : { duration: 0 }}
            >
              &amp; {weddingConfig.bride}
            </motion.span>
          </h1>

          {/* Dynamic Date & Location Block - Chạy từ 2 bên vào */}
          {guest?.eventType === "wedding" ? (
            <motion.div
              className="mt-6 flex items-center gap-3.5 sm:mt-7"
              initial={animated ? { x: -80, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={animated ? { duration: 0.85, delay: 0.85, ease: slideEase } : { duration: 0 }}
            >
              <time
                dateTime={weddingConfig.events.wedding.dateIso.slice(0, 10)}
                className="font-display text-2xl tracking-[-0.03em] text-[var(--foreground)] sm:text-3xl"
              >
                {weddingConfig.events.wedding.shortDate}
              </time>
              <span aria-hidden className="h-px w-10 bg-[var(--accent)]/45" />
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] font-medium">
                {weddingConfig.events.wedding.locationCity}
              </span>
            </motion.div>
          ) : guest?.eventType === "reception" ? (
            <motion.div
              className="mt-6 flex items-center gap-3.5 sm:mt-7"
              initial={animated ? { x: 80, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={animated ? { duration: 0.85, delay: 0.85, ease: slideEase } : { duration: 0 }}
            >
              <time
                dateTime={weddingConfig.events.reception.dateIso.slice(0, 10)}
                className="font-display text-2xl tracking-[-0.03em] text-[var(--foreground)] sm:text-3xl"
              >
                {weddingConfig.events.reception.shortDate}
              </time>
              <span aria-hidden className="h-px w-10 bg-[var(--accent)]/45" />
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] font-medium">
                {weddingConfig.events.reception.locationCity}
              </span>
            </motion.div>
          ) : (
            <div className="mt-6 space-y-2.5 sm:mt-7">
              {/* 22.09.2026 Tỉnh Vĩnh Long - Chạy từ bên TRÁI vào */}
              <motion.div
                className="flex items-center gap-3"
                initial={animated ? { x: -80, opacity: 0 } : false}
                animate={{ x: 0, opacity: 1 }}
                transition={animated ? { duration: 0.85, delay: 0.85, ease: slideEase } : { duration: 0 }}
              >
                <time
                  dateTime={weddingConfig.events.wedding.dateIso.slice(0, 10)}
                  className="font-display text-2xl tracking-[-0.03em] text-[var(--foreground)] sm:text-3xl"
                >
                  {weddingConfig.events.wedding.shortDate}
                </time>
                <span aria-hidden className="h-px w-8 bg-[var(--accent)]/45" />
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] font-medium">
                  {weddingConfig.events.wedding.locationCity}
                </span>
              </motion.div>

              {/* 26.09.2026 TP. Hồ Chí Minh - Chạy từ bên PHẢI vào */}
              <motion.div
                className="flex items-center gap-3"
                initial={animated ? { x: 80, opacity: 0 } : false}
                animate={{ x: 0, opacity: 1 }}
                transition={animated ? { duration: 0.85, delay: 1.0, ease: slideEase } : { duration: 0 }}
              >
                <time
                  dateTime={weddingConfig.events.reception.dateIso.slice(0, 10)}
                  className="font-display text-2xl tracking-[-0.03em] text-[var(--foreground)] sm:text-3xl"
                >
                  {weddingConfig.events.reception.shortDate}
                </time>
                <span aria-hidden className="h-px w-8 bg-[var(--accent)]/45" />
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] font-medium">
                  {weddingConfig.events.reception.locationCity}
                </span>
              </motion.div>
            </div>
          )}

          {/* Action CTAs */}
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-9"
            initial={animated ? { y: 30, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={animated ? { duration: 0.8, delay: 1.15, ease: slideEase } : { duration: 0 }}
          >
            <a
              href="#events"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] active:scale-[0.98]"
            >
              <Heart size={16} weight="fill" />
              <span>Xem chi tiết thiệp mời</span>
            </a>
            <a
              href="#album"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-6 py-3.5 text-sm font-semibold text-[var(--foreground)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-[var(--surface-strong)] active:scale-[0.98]"
            >
              <span>Xem Album ảnh</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
