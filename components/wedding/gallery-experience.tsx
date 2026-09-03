"use client";

import { useState } from "react";
import type { AlbumImage } from "@/content/wedding";
import { AlbumImageView } from "./album-image";
import { Lightbox } from "./lightbox";
import { Reveal } from "./reveal";

export function GalleryExperience({ images }: { images: AlbumImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-12 sm:gap-7">
        {images.map((image, index) => {
          const isLandscape = image.width > image.height;
          const span = isLandscape ? "sm:col-span-8" : "sm:col-span-4";
          const ratio = isLandscape ? "aspect-[3/2]" : "aspect-[2/3]";
          return (
            <Reveal key={image.id} delay={Math.min(index * 0.025, 0.2)} className={span}>
              <AlbumImageView image={image} className={ratio} sizes="(max-width: 767px) 100vw, 66vw" onClick={() => setActiveIndex(index)} />
            </Reveal>
          );
        })}
      </div>
      <Lightbox images={images} activeIndex={activeIndex} onClose={() => setActiveIndex(null)} onChange={setActiveIndex} />
    </>
  );
}
