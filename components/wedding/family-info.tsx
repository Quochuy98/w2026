"use client";

import NextImage from "next/image";
import { weddingConfig, type AlbumImage, type WeddingSlot, type AvatarCropConfig } from "@/content/wedding";

import { Reveal } from "./reveal";
import { Heart } from "@phosphor-icons/react";
import { HeartBubbles } from "./heart-bubbles";

interface FamilyInfoProps {
  slots: Record<WeddingSlot, AlbumImage>;
  groomCrop?: AvatarCropConfig;
  brideCrop?: AvatarCropConfig;
}

export function FamilyInfo({ slots, groomCrop: propGroomCrop, brideCrop: propBrideCrop }: FamilyInfoProps) {
  const { groom, bride } = weddingConfig.family;

  const groomCrop = propGroomCrop || groom.avatarCrop || { x: 50, y: 25, zoom: 1 };
  const brideCrop = propBrideCrop || bride.avatarCrop || { x: 50, y: 25, zoom: 1 };

  const groomAvatarImage: AlbumImage = groom.avatarImage
    ? {
        id: "groom-custom-avatar",
        src: groom.avatarImage,
        width: 1200,
        height: 1200,
        alt: `Ảnh ${groom.fullName}`,
        tags: ["groom-avatar"],
        source: "fallback",
        order: 0,
        layout: "portrait",
      }
    : slots["portrait-two"];

  const brideAvatarImage: AlbumImage = bride.avatarImage
    ? {
        id: "bride-custom-avatar",
        src: bride.avatarImage,
        width: 1200,
        height: 1200,
        alt: `Ảnh ${bride.fullName}`,
        tags: ["bride-avatar"],
        source: "fallback",
        order: 0,
        layout: "portrait",
      }
    : slots["portrait-one"];

  return (
    <section aria-labelledby="family-heading" className="relative mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
      <Reveal className="mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
          Gia đình hai bên
        </p>
        <h2
          id="family-heading"
          className="font-display text-4xl leading-[1.05] tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl lg:text-6xl"
        >
          Lời Chào Từ Hai Gia Đình
        </h2>
        <div className="mx-auto mt-4 h-px w-16 bg-[var(--accent)]/40" />
      </Reveal>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {/* Nhà Trai */}
        <Reveal>
          <div className="relative flex flex-col items-center rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/60 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-[var(--accent)]/40 sm:p-10">
            <span className="mb-6 inline-block rounded-full bg-[var(--accent)]/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Nhà Trai
            </span>

            {/* Avatar Chú rể có crop và zoom khuôn mặt + Hiệu ứng trái tim bay như bong bóng */}
            <div className="relative mb-6 h-36 w-36 sm:h-44 sm:w-44">
              <HeartBubbles />
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[var(--surface)] bg-[var(--surface)] shadow-md">
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    transform: `scale(${groomCrop.zoom})`,
                    transformOrigin: `${groomCrop.x}% ${groomCrop.y}%`,
                  }}
                >
                  <NextImage
                    src={groomAvatarImage.src}
                    alt={groomAvatarImage.alt}
                    fill
                    sizes="(max-width: 640px) 150px, 180px"
                    style={{
                      objectFit: "cover",
                      objectPosition: `${groomCrop.x}% ${groomCrop.y}%`,
                    }}
                    className="transition-transform duration-500"
                    unoptimized={groomAvatarImage.src.startsWith("/")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Thân Phụ &amp; Thân Mẫu</p>
              <p className="text-base font-medium text-[var(--foreground)] sm:text-lg">{groom.parents.father}</p>
              <p className="text-base font-medium text-[var(--foreground)] sm:text-lg">{groom.parents.mother}</p>
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--line)] w-full">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] mb-1">{groom.roleTitle}</p>
              <h3 className="font-display text-2xl sm:text-3xl text-[var(--foreground)] tracking-[-0.03em]">
                {groom.fullName}
              </h3>
            </div>
          </div>
        </Reveal>

        {/* Nhà Gái */}
        <Reveal>
          <div className="relative flex flex-col items-center rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/60 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-[var(--accent)]/40 sm:p-10">
            <span className="mb-6 inline-block rounded-full bg-[var(--accent)]/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Nhà Gái
            </span>

            {/* Avatar Cô dâu có crop và zoom khuôn mặt + Hiệu ứng trái tim bay như bong bóng */}
            <div className="relative mb-6 h-36 w-36 sm:h-44 sm:w-44">
              <HeartBubbles />
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[var(--surface)] bg-[var(--surface)] shadow-md">
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    transform: `scale(${brideCrop.zoom})`,
                    transformOrigin: `${brideCrop.x}% ${brideCrop.y}%`,
                  }}
                >
                  <NextImage
                    src={brideAvatarImage.src}
                    alt={brideAvatarImage.alt}
                    fill
                    sizes="(max-width: 640px) 150px, 180px"
                    style={{
                      objectFit: "cover",
                      objectPosition: `${brideCrop.x}% ${brideCrop.y}%`,
                    }}
                    className="transition-transform duration-500"
                    unoptimized={brideAvatarImage.src.startsWith("/")}
                  />
                </div>
              </div>
            </div>



            <div className="space-y-1 mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Thân Phụ &amp; Thân Mẫu</p>
              <p className="text-base font-medium text-[var(--foreground)] sm:text-lg">{bride.parents.father}</p>
              <p className="text-base font-medium text-[var(--foreground)] sm:text-lg">{bride.parents.mother}</p>
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--line)] w-full">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)] mb-1">{bride.roleTitle}</p>
              <h3 className="font-display text-2xl sm:text-3xl text-[var(--foreground)] tracking-[-0.03em]">
                {bride.fullName}
              </h3>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Decorative center icon */}
      <div className="mt-12 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
        <span className="h-px w-12 bg-[var(--line)]" />
        <span className="flex items-center gap-1 text-[var(--accent)]">
          <Heart size={14} weight="fill" />
          <span>Hạnh Phúc Trọn Vẹn</span>
        </span>
        <span className="h-px w-12 bg-[var(--line)]" />
      </div>
    </section>
  );
}
