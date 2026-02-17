"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
};

type Props = {
  images: GalleryImage[];
};

export function ProductGallery({ images }: Props) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full bg-base-200 flex items-center justify-center">
        <span className="text-base-content/40">No image</span>
      </div>
    );
  }

  const main = images[selected];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square w-full overflow-hidden bg-base-200">
        <Image
          src={main.url}
          alt={main.alt}
          width={800}
          height={800}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 transition-colors ${
                i === selected
                  ? "border-base-content"
                  : "border-transparent hover:border-base-content/30"
              }`}
            >
              <Image
                src={img.thumbUrl}
                alt={img.alt}
                width={200}
                height={200}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
