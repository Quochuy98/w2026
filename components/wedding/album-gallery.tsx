"use client";

import { useMemo, useState } from "react";
import type { AlbumImage, WeddingSlot } from "@/content/wedding";
import { AlbumImageView } from "./album-image";
import { Lightbox } from "./lightbox";
import { Reveal } from "./reveal";

type AlbumGalleryProps = {
  slots: Record<WeddingSlot, AlbumImage>;
  remaining?: AlbumImage[];
  images?: AlbumImage[];
};

export function AlbumGallery({ slots, remaining = [], images: propImages }: AlbumGalleryProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Danh sách đầy đủ và duy nhất toàn bộ ảnh trong album
  const images = useMemo(() => {
    if (propImages && propImages.length > 0) {
      const seen = new Set<string>();
      return propImages.filter((img) => {
        if (!img || seen.has(img.id)) return false;
        seen.add(img.id);
        return true;
      });
    }

    const featured = [
      slots.opening,
      slots["portrait-one"],
      slots["portrait-two"],
      ...remaining,
      slots["detail-one"],
      slots["detail-two"],
      slots.closing,
    ];
    const seen = new Set<string>();
    return featured.filter((image) => {
      if (!image || seen.has(image.id)) return false;
      seen.add(image.id);
      return true;
    });
  }, [propImages, remaining, slots]);

  const activeIndex = activeId === null ? null : images.findIndex((image) => image.id === activeId);

  const open = (id: string) => setActiveId(id);
  const change = (index: number) => setActiveId(images[index]?.id ?? null);

  // Chọn ảnh mở đầu lớn ở trên (chỉ chọn từ danh sách ảnh đang hiển thị trong album)
  const openingImage =
    images.find((img) => img.id === slots.opening?.id) ||
    images.find((img) => img.width > img.height) ||
    images[0];

  // Toàn bộ các ảnh còn lại được phân bổ vào lưới Masonry không bao giờ bị khoảng trống
  const galleryItems = images.filter((img) => img.id !== openingImage?.id);

  return (
    <>
      {/* 1. Ảnh Mở Đầu Toàn Cảnh (Panorama Feature) */}
      {openingImage && (
        <Reveal className="mb-6 sm:mb-8">
          <AlbumImageView
            image={openingImage}
            className="aspect-[16/9] sm:aspect-[2.1/1]"
            sizes="100vw"
            onClick={() => open(openingImage.id)}
          />
        </Reveal>
      )}

      {/* 2. Lưới Ảnh Ngay Hàng Thẳng Lối (Uniform Elegant Grid - Không bao giờ bị thủng lỗ) */}
      {galleryItems.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
          {galleryItems.map((image, index) => {
            const isLastOddOnMobile = index === galleryItems.length - 1 && galleryItems.length % 2 !== 0;
            return (
              <div
                key={image.id}
                className={isLastOddOnMobile ? "col-span-2 lg:col-span-1" : ""}
              >
                <Reveal delay={Math.min(index * 0.04, 0.25)}>
                  <AlbumImageView
                    image={image}
                    className={
                      isLastOddOnMobile
                        ? "aspect-[16/9] lg:aspect-[4/5]"
                        : "aspect-[3/4] sm:aspect-[4/5]"
                    }
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onClick={() => open(image.id)}
                  />
                </Reveal>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Trình Xem Ảnh Phóng To Toàn Màn Hình (Lightbox Crystal Clear) */}
      <Lightbox
        images={images}
        activeIndex={activeIndex === -1 ? null : activeIndex}
        onClose={() => setActiveId(null)}
        onChange={change}
      />
    </>
  );
}
