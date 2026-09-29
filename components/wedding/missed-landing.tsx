"use client";

import { useEffect } from "react";
import { NotFoundMascot } from "@/components/wedding/not-found-mascot";
import { WeddingGift } from "@/components/wedding/wedding-gift";
import { Reveal } from "@/components/wedding/reveal";
import { Sparkle, Heart } from "@phosphor-icons/react";
import { type GuestInfo } from "@/content/wedding";

interface MissedLandingProps {
  guest?: GuestInfo | null;
  code?: string;
}

export function MissedLanding({ guest, code }: MissedLandingProps) {
  useEffect(() => {
    if (code) {
      // Ping API to record view count in Supabase
      fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }).catch(() => {});
    }
  }, [code]);

  return (
    <main className="min-h-[100dvh] w-full bg-[var(--background)] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl text-center">
        {/* Mascot & Heading Section */}
        <Reveal className="flex flex-col items-center">
          <div className="mb-6">
            <NotFoundMascot />
          </div>
          
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--surface)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            <Sparkle size={14} weight="fill" className="text-amber-500" />
            <span>Quốc Huy & Hoài Thương</span>
            <Heart size={14} weight="fill" className="text-rose-500" />
          </div>

          {guest && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)]/10 px-5 py-2 text-sm font-semibold text-[var(--accent-strong)] border border-[var(--accent)]/20 animate-in fade-in duration-300">
              <span>Trân trọng kính mời {guest.salutation} {guest.name}</span>
            </div>
          )}

          <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Hehehe bạn đã bỏ lỡ điều gì à?
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {guest
              ? `Tình cảm và sự hiện diện của ${guest.salutation} ${guest.name} là món quà tuyệt vời nhất dành cho bọn mình!`
              : "Dù đường dẫn bạn truy cập có là gì đi nữa, tình cảm và sự hiện diện của bạn vẫn là món quà tuyệt vời nhất dành cho bọn mình!"}
          </p>
        </Reveal>

        {/* Wedding Gift Component */}
        <div className="mt-8">
          <WeddingGift guest={guest} initialOpen={true} />
        </div>
      </div>
    </main>
  );
}
