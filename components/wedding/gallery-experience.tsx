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
          const layout = image.layout ?? (index % 5 === 0 ? "wide" : index % 3 === 0 ? "portrait" : "standard");
          const span = layout === "wide" ? "sm:col-span-8" : layout === "portrait" ? "sm:col-span-4" : index % 2 === 0 ? "sm:col-span-5" : "sm:col-span-7";
          const ratio = layout === "portrait" ? "aspect-[4/5]" : layout === "wide" ? "aspect-[16/10]" : index % 4 === 0 ? "aspect-[5/4]" : "aspect-[4/3]";
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
