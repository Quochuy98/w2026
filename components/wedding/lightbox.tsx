"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import type { AlbumImage } from "@/content/wedding";
import { useWeddingReducedMotion } from "./use-reduced-motion";

type LightboxProps = {
  images: AlbumImage[];
  activeIndex: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function Lightbox({ images, activeIndex, onClose, onChange }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const restoreFocusIdRef = useRef<string | null>(null);
  const bodyOverflowRef = useRef("");
  const openRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const reduce = useWeddingReducedMotion();

  const restoreFocus = () => {
    let target = restoreFocusRef.current;
    if (!target?.isConnected && restoreFocusIdRef.current) {
      target = Array.from(document.querySelectorAll<HTMLElement>("[data-gallery-image-id]"))
        .find((element) => element.dataset.galleryImageId === restoreFocusIdRef.current) || null;
    }
    if (target?.isConnected) target.focus();
    restoreFocusRef.current = null;
    restoreFocusIdRef.current = null;
  };

  useEffect(() => {
    if (activeIndex !== null && !openRef.current) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      restoreFocusIdRef.current = restoreFocusRef.current?.dataset.galleryImageId || null;
      bodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      openRef.current = true;
      closeRef.current?.focus();
    }

    if (activeIndex === null) {
      if (openRef.current) {
        document.body.style.overflow = bodyOverflowRef.current;
        openRef.current = false;
        // AnimatePresence may keep the closing layer mounted for one frame.
        // The exit callback below performs the final focus hand-off after it
        // has left the document, which also avoids a mobile WebKit race.
        if (reduce) restoreFocus();
      }
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onChange((activeIndex + 1) % images.length);
      if (event.key === "ArrowLeft") onChange((activeIndex - 1 + images.length) % images.length);
      if (event.key === "Tab") {
        const focusable = [closeRef.current, previousRef.current, nextRef.current].filter(
          (element): element is HTMLButtonElement => Boolean(element && !element.disabled),
        );
        if (focusable.length === 0) return;
        const current = focusable.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.shiftKey
          ? (current <= 0 ? focusable.length - 1 : current - 1)
          : (current + 1) % focusable.length;
        event.preventDefault();
        focusable[next]?.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex, images.length, onChange, onClose, reduce]);

  useEffect(() => () => {
    if (openRef.current) {
      document.body.style.overflow = bodyOverflowRef.current;
      restoreFocus();
    }
  }, []);

  const image = activeIndex === null ? null : images[activeIndex];

  return (
    <AnimatePresence onExitComplete={restoreFocus}>
      {image && activeIndex !== null && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh cưới"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#11171b]/95 p-4 sm:p-8"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = touchStartX.current;
            const end = event.changedTouches[0]?.clientX;
            if (start === null || end === undefined) return;
            const delta = end - start;
            if (Math.abs(delta) > 48) onChange((activeIndex + (delta < 0 ? 1 : -1) + images.length) % images.length);
            touchStartX.current = null;
          }}
        >
          <div className="relative flex h-full w-full max-w-6xl items-center justify-center">
            <button ref={closeRef} type="button" onClick={onClose} className="absolute right-0 top-0 z-[2] inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20" aria-label="Đóng ảnh">
              <X size={22} weight="regular" />
            </button>
            <button ref={previousRef} type="button" onClick={() => onChange((activeIndex - 1 + images.length) % images.length)} className="absolute left-0 top-1/2 z-[2] -translate-y-1/2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20" aria-label="Ảnh trước">
              <ArrowLeft size={22} weight="regular" />
            </button>
            <button ref={nextRef} type="button" onClick={() => onChange((activeIndex + 1) % images.length)} className="absolute right-0 top-1/2 z-[2] -translate-y-1/2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20" aria-label="Ảnh tiếp theo">
              <ArrowRight size={22} weight="regular" />
            </button>
            <motion.div
              key={image.id}
              className="relative max-h-[88dvh] w-full max-w-5xl overflow-hidden rounded-[1.25rem]"
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 768px) 92vw, 88vw" className="max-h-[88dvh] w-full object-contain" unoptimized={true} priority />

            </motion.div>
            <p className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-4 py-2 text-center text-xs text-white/85 backdrop-blur-sm">
              Ảnh {activeIndex + 1} trên {images.length}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
