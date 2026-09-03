"use client";

import NextImage from "next/image";
import { useState } from "react";
import type { AlbumImage } from "@/content/wedding";

type AlbumImageViewProps = {
  image: AlbumImage;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onClick?: () => void;
};

export function AlbumImageView({ image, priority = false, sizes = "100vw", className = "", onClick }: AlbumImageViewProps) {
  const [failed, setFailed] = useState(false);
  const src = image.src;

  const content = failed ? (
    <span className="flex h-full min-h-40 items-center justify-center px-6 text-center text-sm text-[var(--muted)]">
      Ảnh tạm thời chưa thể tải.
    </span>
  ) : (
    <NextImage
      src={src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className="h-full w-full object-cover object-[center_15%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025]"
      unoptimized={true}
      onError={() => setFailed(true)}
    />
  );

  const classNames = `group relative block w-full overflow-hidden rounded-[1.25rem] bg-[var(--surface)] text-left ${onClick ? "cursor-zoom-in" : "cursor-default"} ${className}`;
  const wrapper = (
    <span className={classNames}>
      <span className="absolute inset-0 z-[1] bg-[var(--accent)]/0 transition-colors duration-500 group-hover:bg-[var(--accent)]/10" />
      {content}
    </span>
  );

  if (!onClick) return wrapper;
  return (
    <button type="button" onClick={onClick} className="block w-full text-left" data-gallery-image-id={image.id} aria-label={`Mở ${image.alt}`}>
      {wrapper}
    </button>
  );
}
