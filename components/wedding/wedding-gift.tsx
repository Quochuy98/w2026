"use client";

import { useState } from "react";
import Image from "next/image";
import { weddingConfig } from "@/content/wedding";
import { Reveal } from "./reveal";
import { Gift, Copy, Check, QrCode, CaretDown, CaretUp, Sparkle, Heart } from "@phosphor-icons/react";

export function WeddingGift() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const gift = weddingConfig.gift;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(gift.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <section id="gifts" aria-labelledby="gifts-heading" className="relative mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
          Gửi Quà Mừng
        </p>
        <h2
          id="gifts-heading"
          className="font-display text-4xl leading-[1.05] tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl lg:text-6xl"
        >
          Hộp Mừng Cưới
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-[var(--accent)]/40" />
        <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">
          Tình cảm và sự hiện diện của Quý khách là món quà quý giá nhất. Nếu muốn gửi lời chúc phúc và mừng cưới từ xa, Quý khách có thể mở hộp mừng bên dưới:
        </p>
      </Reveal>

      <div className="mx-auto max-w-xl">
        <Reveal>
          {/* Hộp Mừng Cưới Màu Đỏ Sang Trọng */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`group relative cursor-pointer overflow-hidden rounded-[2rem] border-2 border-amber-400/40 bg-[linear-gradient(145deg,#8C152B_0%,#B81E38_45%,#700B1A_100%)] p-7 sm:p-10 text-center text-white shadow-[0_20px_50px_rgba(140,21,43,0.3)] transition-all duration-500 hover:scale-[1.01] hover:border-amber-300 hover:shadow-[0_25px_60px_rgba(140,21,43,0.4)] ${
              !isOpen ? "animate-gift-shake" : ""
            }`}
          >
            {/* Background Decorative Gold Foil Corners */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/15 blur-2xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-amber-400/10 blur-2xl" />

            {/* Header / Gift Box Icon */}
            <div
              className={`relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-300/50 bg-[linear-gradient(135deg,#D4AF37_0%,#AA771C_100%)] text-white shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 ${
                !isOpen ? "animate-gift-icon" : ""
              }`}
            >
              <Gift size={38} weight="fill" className="text-amber-100" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-black/20 px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-amber-200">
                <Sparkle size={13} weight="fill" className="text-amber-300" />
                <span>Mừng Hạnh Phúc Đôi Uyên Ương</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl text-amber-50 tracking-[-0.02em] mt-3">
                {gift.name}
              </h3>

              {/* Action Button to Open/Close */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-400/20 px-5 py-2.5 text-xs font-semibold text-amber-100 backdrop-blur-sm transition hover:bg-amber-400/30">
                <QrCode size={16} weight="bold" />
                <span>{isOpen ? "Thu gọn hộp mừng" : "Mở Hộp Mừng & Quét Mã QR"}</span>
                {isOpen ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
              </div>

            </div>

            {/* QR Content Area (Revealed on Click) */}
            {isOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 mt-8 cursor-default rounded-2xl border border-amber-300/30 bg-white/95 p-6 sm:p-8 text-[var(--foreground)] shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="mb-4 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  <Heart size={14} weight="fill" className="text-rose-500" />
                  <span>Quét Mã VietQR Chuyển Khoản</span>
                </div>

                {/* QR Code */}
                <div className="relative mx-auto mb-6 aspect-square w-52 sm:w-60 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white p-3 shadow-inner">
                  <Image
                    src={gift.qrUrl}
                    alt={`Mã QR mừng cưới ${gift.name}`}
                    width={300}
                    height={300}
                    unoptimized
                    className="h-full w-full object-contain rounded-lg"
                  />
                </div>

                {/* Account Details Box */}
                <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Số Tài Khoản Ngân Hàng ({gift.bankCode}):</p>
                  <p className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-gray-900">
                    {gift.accountNumber}
                  </p>
                  <p className="text-xs font-medium text-gray-600 mt-1">Chủ tài khoản: {gift.name}</p>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 px-5 text-xs font-semibold transition-all active:scale-[0.98] ${
                      copied
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)] shadow-sm"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={16} weight="bold" />
                        <span>Đã sao chép số tài khoản!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} weight="bold" />
                        <span>Sao chép số tài khoản</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
