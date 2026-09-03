"use client";

import { motion } from "motion/react";
import { weddingConfig, type AlbumImage, type GuestInfo, type WeddingSlot } from "@/content/wedding";
import { AlbumImageView } from "./album-image";
import { EnvelopeSimpleOpen, Sparkle, Heart } from "@phosphor-icons/react";

interface InvitationHeroProps {
  slots: Record<WeddingSlot, AlbumImage>;
  guest?: GuestInfo | null;
}

export function InvitationHero({ slots, guest }: InvitationHeroProps) {
  // Easing mượt mà chuẩn điện ảnh cho hiệu ứng trình chiếu
  const slideEase = [0.16, 1, 0.3, 1] as const;

  // Câu chào mời khách - Dùng chung 1 form capsule pill thanh lịch bo tròn cho tất cả
  const invitationHeadline = guest ? (
    <div className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1 text-[0.68rem] sm:text-[0.72rem] font-semibold tracking-normal sm:tracking-[0.12em] text-[var(--accent-strong)] backdrop-blur-sm sm:mb-5">
      <Sparkle size={12} weight="fill" className="text-[var(--accent)] shrink-0" />
      <span className="break-words">
        Trân trọng kính mời:{" "}
        <strong className="text-[var(--foreground)] font-bold">
          {guest.salutation} {guest.name}
        </strong>
      </span>
    </div>
  ) : (
    <div className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-1 text-[0.68rem] sm:text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)] backdrop-blur-sm sm:mb-5">
      <Sparkle size={12} weight="fill" className="text-[var(--accent)] shrink-0" />
      <span>Trân trọng kính mời Quý khách & Gia đình</span>
    </div>
  );

  return (
    <section id="top" className="relative isolate min-h-[100dvh] overflow-hidden bg-[var(--surface-strong)]">
      {/* Background Hero Image - Animation trượt từ dưới lên */}
      <motion.div
        className="absolute inset-0"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: slideEase }}
      >
        <AlbumImageView
          image={slots.hero}
          priority
          sizes="100vw"
          className="h-full min-h-[100dvh] !rounded-none [&>img]:object-[58%_38%] sm:[&>img]:object-[50%_22%]"
        />
        {/* Subtle Luxury Gradient Overlay - Desktop 100% tự nhiên không blur; Mobile dịu mát không trắng đục */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(244_247_248_/_0.35)_0%,transparent_30%,transparent_65%,rgb(244_247_248_/_0.35)_100%)] sm:bg-[linear-gradient(90deg,rgb(244_247_248_/_0.93)_0%,rgb(244_247_248_/_0.72)_38%,rgb(244_247_248_/_0.25)_65%,rgb(244_247_248_/_0.06)_100%),linear-gradient(0deg,rgb(36_50_59_/_0.15)_0%,transparent_50%)]"
        />
      </motion.div>

      {/* Top Monogram Header [H&T] - Chạy từ bên TRÁI vào */}
      <header className="absolute inset-x-0 top-0 z-[2]">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <motion.a
            href="#top"
            className="font-display text-2xl tracking-[-0.04em] text-[var(--foreground)] transition-opacity hover:opacity-80 inline-block"
            aria-label="Về đầu trang"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: slideEase }}
          >
            {weddingConfig.monogram}
          </motion.a>
        </div>
      </header>

      {/* Main Content Hero */}
      <div className="relative z-[1] mx-auto flex min-h-[100dvh] w-full max-w-[1400px] items-center px-4 pt-14 pb-12 sm:px-8 sm:pt-24 sm:pb-16 lg:px-12">
        <div className="w-full max-w-[46rem] overflow-visible">
          {/* Trân trọng kính mời Quý khách & Gia đình - Chạy từ bên TRÁI vào */}
          <motion.div
            initial={{ x: -90, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.25, ease: slideEase }}
          >
            {invitationHeadline}
          </motion.div>

          {/* Vùng chữ có blur nhẹ trên mobile để thấy rõ ràng không bị chìm vào ảnh, desktop giữ nguyên */}
          <div className="rounded-2xl p-4 sm:p-0 bg-white/45 sm:bg-transparent backdrop-blur-[6px] sm:backdrop-blur-none border border-white/40 sm:border-transparent shadow-sm sm:shadow-none">
            {/* Wedding Invitation - Chạy từ bên PHẢI vào */}
            <motion.p
              className="mb-2 text-[0.65rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]"
              initial={{ x: 90, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.4, ease: slideEase }}
            >
              Wedding Invitation
            </motion.p>

            {/* Tên Chú rể & Cô dâu - Chạy từ 2 bên vào gặp nhau */}
            <h1 className="font-display max-w-none pb-2 text-[clamp(2.3rem,6.8vw,6.5rem)] leading-[1.04] tracking-[-0.055em] text-[var(--foreground)] sm:text-[clamp(3.75rem,7vw,6.5rem)] overflow-hidden">
              {/* Quốc Huy - Chạy từ bên TRÁI vào */}
              <motion.span
                className="block"
                initial={{ x: -110, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.55, ease: slideEase }}
              >
                {weddingConfig.groom}
              </motion.span>
              {/* & Hoài Thương - Chạy từ bên PHẢI vào */}
              <motion.span
                className="block italic font-light"
                initial={{ x: 110, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.7, ease: slideEase }}
              >
                &amp; {weddingConfig.bride}
              </motion.span>
            </h1>

            {/* Dynamic Date & Location Block - Chạy từ 2 bên vào */}
            {guest?.eventType === "wedding" ? (
              <motion.div
                className="mt-4 flex items-center gap-3.5 sm:mt-7"
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.85, delay: 0.85, ease: slideEase }}
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
                className="mt-4 flex items-center gap-3.5 sm:mt-7"
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.85, delay: 0.85, ease: slideEase }}
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
              <div className="mt-4 space-y-2 sm:mt-7 sm:space-y-2.5">
                {/* 22.09.2026 Tỉnh Vĩnh Long - Chạy từ bên TRÁI vào */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.85, ease: slideEase }}
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
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.85, delay: 1.0, ease: slideEase }}
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
          </div>

          {/* Action CTAs */}
          <motion.div
            className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-9 sm:gap-3.5"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.15, ease: slideEase }}
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
