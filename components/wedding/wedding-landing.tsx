import {
  WEDDING_SLOTS,
  weddingConfig,
  getWeddingEvent,
  type AlbumImage,
  type GuestInfo,
  type WeddingSlot,
  type AvatarCropConfig,
} from "@/content/wedding";
import { Countdown } from "./countdown";
import { Reveal } from "./reveal";
import { AlbumGallery } from "./album-gallery";
import { InvitationHero } from "./invitation-hero";
import { FamilyInfo } from "./family-info";
import { EventDetails } from "./event-details";
import { WeddingGift } from "./wedding-gift";
import { ThankYou } from "./thank-you";
import { MusicPlayer } from "./music-player";

type WeddingLandingProps = {
  images: AlbumImage[];
  slots: Record<WeddingSlot, AlbumImage>;
  isFallback: boolean;
  guest?: GuestInfo | null;
  groomCrop?: AvatarCropConfig;
  brideCrop?: AvatarCropConfig;
};

export function WeddingLanding({ images, slots, isFallback, guest, groomCrop, brideCrop }: WeddingLandingProps) {
  const remaining = images.filter((image) => !WEDDING_SLOTS.some((slot) => slots[slot]?.id === image.id));
  const weddingEvent = getWeddingEvent(guest?.side);
  const countdownTargetIso = guest?.eventType === "reception"
    ? weddingConfig.events.reception.dateIso
    : weddingEvent.dateIso;

  return (
    <main className="overflow-clip">
      {/* 1. Hero Thiệp Mời */}
      <InvitationHero slots={slots} guest={guest} />

      {/* 2. Thông Tin Hai Bên Gia Đình */}
      <FamilyInfo slots={slots} groomCrop={groomCrop} brideCrop={brideCrop} />


      {/* 3. Bộ Đếm Ngược Ngày Cưới */}
      <Countdown targetIso={countdownTargetIso} />

      {/* 4. Thời Gian & Địa Điểm Sự Kiện (Tư Gia / Báo Hỷ) */}
      <EventDetails guest={guest} />

      {/* 5. Hộp Mừng Cưới & QR VietQR */}
      <WeddingGift />

      {/* 6. Lời Cảm Ơn Từ Cô Dâu Chú Rể */}
      <ThankYou />

      {/* 7. Toàn Bộ Album Ảnh Cưới */}
      <section id="album" aria-labelledby="album-title" className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
            Album Ảnh Cưới
          </p>
          <h2 id="album-title" className="font-display text-4xl leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Những Khoảnh Khắc Hạnh Phúc
          </h2>
          <div className="mt-4 h-px w-16 bg-[var(--accent)]/40" />
        </Reveal>

        <AlbumGallery images={images} slots={slots} remaining={remaining} />


        {isFallback && (
          <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-[var(--muted)]">
            Đang hiển thị ảnh minh họa. Bạn có thể thay bằng album thật tại trang quản trị.
          </p>
        )}
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-[var(--line)] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 bg-[var(--surface-strong)]/40">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-4xl tracking-[-0.05em]">{weddingConfig.monogram}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {weddingConfig.groom} &amp; {weddingConfig.bride} &bull; {weddingConfig.dateLabel}
            </p>
          </div>
          <p className="text-sm text-[var(--muted)]">Trân trọng cảm ơn sự hiện diện và chúc phúc của Quý khách!</p>
        </div>
      </footer>

      {/* 9. Trình Phát Nhạc Nền Tinh Tế */}
      <MusicPlayer />
    </main>
  );
}

