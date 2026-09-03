"use client";

import { weddingConfig } from "@/content/wedding";
import { Reveal } from "./reveal";
import { Heart } from "@phosphor-icons/react";

export function ThankYou() {
  const { title, content } = weddingConfig.thankYouMessage;

  return (
    <section aria-labelledby="thankyou-heading" className="relative mx-auto w-full max-w-[1000px] px-5 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/30 bg-[linear-gradient(135deg,var(--surface-strong)_0%,var(--surface)_100%)] p-8 text-center shadow-lg backdrop-blur-md sm:p-14">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent-strong)]">
            <Heart size={24} weight="fill" />
          </div>

          <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
            From the Bride &amp; Groom
          </p>

          <h2
            id="thankyou-heading"
            className="font-display text-3xl sm:text-4xl lg:text-5xl text-[var(--foreground)] tracking-[-0.03em] mb-6"
          >
            {title}
          </h2>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--muted)] italic">
            &ldquo;{content}&rdquo;
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-1">
            <div className="font-display text-2xl sm:text-3xl text-[var(--foreground)] font-semibold tracking-[-0.02em]">
              {weddingConfig.groom} &amp; {weddingConfig.bride}
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-medium">
              {weddingConfig.dateLabel}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
