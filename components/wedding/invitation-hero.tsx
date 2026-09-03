"use client";

import { weddingConfig, type AlbumImage, type GuestInfo, type WeddingSlot } from "@/content/wedding";
import { AlbumImageView } from "./album-image";
import { Reveal } from "./reveal";
import { EnvelopeSimpleOpen, Sparkle, Heart } from "@phosphor-icons/react";

interface InvitationHeroProps {
  slots: Record<WeddingSlot, AlbumImage>;
  guest?: GuestInfo | null;
}

export function InvitationHero({ slots, guest }: InvitationHeroProps) {
  const weddingDate = weddingConfig.dateIso.slice(0, 10);

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
      {/* Background Hero Image */}
      <div className="absolute inset-0">
        <AlbumImageView
          image={slots.hero}
          priority
          sizes="100vw"
          className="h-full min-h-[100dvh] !rounded-none [&>img]:object-[54%_28%] sm:[&>img]:object-[50%_22%]"
        />
      </div>

      {/* Subtle Luxury Gradient Overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(244_247_248_/_0.92)_0%,rgb(244_247_248_/_0.65)_40%,rgb(244_247_248_/_0.15)_75%),linear-gradient(0deg,rgb(36_50_59_/_0.2)_0%,transparent_50%)] sm:bg-[linear-gradient(90deg,rgb(244_247_248_/_0.93)_0%,rgb(244_247_248_/_0.72)_38%,rgb(244_247_248_/_0.25)_65%,rgb(244_247_248_/_0.06)_100%),linear-gradient(0deg,rgb(36_50_59_/_0.15)_0%,transparent_50%)]"
      />

      {/* Top Monogram Header */}
      <header className="absolute inset-x-0 top-0 z-[2]">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="#top"
            className="font-display text-2xl tracking-[-0.04em] text-[var(--foreground)] transition-opacity hover:opacity-80"
            aria-label="Về đầu trang"
          >
            {weddingConfig.monogram}
          </a>
        </div>
      </header>


      {/* Main Content Hero */}
      <div className="relative z-[1] mx-auto flex min-h-[100dvh] w-full max-w-[1400px] items-center px-5 pt-20 pb-16 sm:px-8 sm:pt-24 lg:px-12">
        <Reveal className="max-w-[46rem]">
          {invitationHeadline}

          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Wedding Invitation
          </p>

          <h1 className="font-display max-w-none pb-2 text-[clamp(2.8rem,7.5vw,6.5rem)] leading-[1.04] tracking-[-0.055em] text-[var(--foreground)] sm:text-[clamp(3.75rem,7vw,6.5rem)]">
            <span className="block">{weddingConfig.groom}</span>
            <span className="block italic font-light">&amp; {weddingConfig.bride}</span>
          </h1>

          {/* Dynamic Date & Location Block */}
          {guest?.eventType === "wedding" ? (
            <div className="mt-6 flex items-center gap-3.5 sm:mt-7">
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
            </div>
          ) : guest?.eventType === "reception" ? (
            <div className="mt-6 flex items-center gap-3.5 sm:mt-7">
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
            </div>
          ) : (
            <div className="mt-6 space-y-2.5 sm:mt-7">
              <div className="flex items-center gap-3">
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
              </div>

              <div className="flex items-center gap-3">
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
              </div>
            </div>
          )}



          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-9">
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}
