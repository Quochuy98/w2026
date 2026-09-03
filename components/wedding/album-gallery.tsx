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

type GalleryRow =
  | { type: "landscape"; image: AlbumImage }
  | { type: "portraits"; images: AlbumImage[] };

function organizeEditorialGallery(items: AlbumImage[]): GalleryRow[] {
  const landscapes = items.filter((img) => img.width > img.height);
  const portraits = items.filter((img) => img.width <= img.height);

  const rows: GalleryRow[] = [];
  let pIdx = 0;
  let lIdx = 0;

  while (pIdx < portraits.length || lIdx < landscapes.length) {
    // 1. Phân bổ ảnh dọc thành các hàng 2 hoặc 3 ảnh
    if (pIdx < portraits.length) {
      const remaining = portraits.length - pIdx;
      // Chia thông minh để luôn khít hàng (3 hoặc 2 ảnh, không bị lẻ 1 ảnh)
      let take = 2;
      if (remaining === 3 || remaining === 6) {
        take = 3;
      } else if (remaining >= 5 && lIdx < landscapes.length) {
        take = 3;
      } else {
        take = 2;
      }
      const actualTake = Math.min(take, remaining);
      rows.push({
        type: "portraits",
        images: portraits.slice(pIdx, pIdx + actualTake),
      });
      pIdx += actualTake;
    }

    // 2. Chèn 1 ảnh ngang (1 hàng 1 ảnh riêng biệt)
    if (lIdx < landscapes.length) {
      rows.push({
        type: "landscape",
        image: landscapes[lIdx],
      });
      lIdx += 1;
    }
  }

  return rows;
}

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

  // 1. Ảnh mở đầu lớn: Luôn là ảnh có chiều ngang (Landscape: width > height)
  const openingImage = useMemo(() => {
    // Ưu tiên slot opening nếu là ảnh ngang
    if (slots.opening && slots.opening.width > slots.opening.height) {
      return slots.opening;
    }
    // Nếu không, tìm ảnh ngang trong danh sách (tránh trùng hero nếu có thể)
    const landscapeDiffHero = images.find(
      (img) => img.width > img.height && img.id !== slots.hero?.id
    );
    if (landscapeDiffHero) return landscapeDiffHero;

    // Bất kỳ ảnh ngang nào
    const anyLandscape = images.find((img) => img.width > img.height);
    if (anyLandscape) return anyLandscape;

    return images[0];
  }, [images, slots.opening, slots.hero]);

  // Toàn bộ các ảnh còn lại được phân bổ vào các hàng theo bố cục Editorial
  const galleryItems = useMemo(
    () => images.filter((img) => img.id !== openingImage?.id),
    [images, openingImage]
  );

  const rows = useMemo(() => organizeEditorialGallery(galleryItems), [galleryItems]);

  return (
    <>
      {/* 1. Ảnh Mở Đầu Toàn Cảnh (Panorama Feature - Luôn là ảnh ngang, tỷ lệ gốc 3:2 tràn viền đẹp mắt) */}
      {openingImage && (
        <Reveal className="mb-6 sm:mb-8">
          <AlbumImageView
            image={openingImage}
            className="aspect-[3/2] w-full shadow-sm"
            sizes="100vw"
            onClick={() => open(openingImage.id)}
          />
        </Reveal>
      )}

      {/* 2. Bố cục Editorial Độc Bản: Ảnh ngang 1 hàng 1 ảnh, Ảnh dọc 1 hàng 2 hoặc 3 ảnh khít rịt */}
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-7">
        {rows.map((row, rowIndex) => {
          if (row.type === "landscape") {
            return (
              <Reveal key={row.image.id} delay={0.04}>
                <AlbumImageView
                  image={row.image}
                  className="aspect-[3/2] w-full shadow-sm"
                  sizes="100vw"
                  onClick={() => open(row.image.id)}
                />
              </Reveal>
            );
          }

          // Cụm ảnh dọc: 2 hoặc 3 ảnh trên 1 hàng (chiều cao bằng nhau tuyệt đối, khít rịt)
          const count = row.images.length;
          const gridCols =
            count === 3
              ? "grid-cols-3 gap-2.5 sm:gap-6 lg:gap-7"
              : count === 2
              ? "grid-cols-2 gap-4 sm:gap-6 lg:gap-7"
              : "grid-cols-1 max-w-md mx-auto";

          return (
            <div key={`row-${rowIndex}`} className={`grid ${gridCols} items-stretch`}>
              {row.images.map((image, imageIndex) => (
                <Reveal key={image.id} delay={imageIndex * 0.04}>
                  <AlbumImageView
                    image={image}
                    className="aspect-[2/3] w-full"
                    sizes={count === 3 ? "(max-width: 640px) 33vw, 33vw" : "(max-width: 640px) 50vw, 50vw"}
                    onClick={() => open(image.id)}
                  />
                </Reveal>
              ))}
            </div>
          );
        })}
      </div>

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
