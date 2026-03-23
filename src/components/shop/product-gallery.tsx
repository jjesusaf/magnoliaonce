"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = {
  id: string;
  url: string;
  fullUrl: string;
  thumbUrl: string;
  alt: string;
};

type Props = {
  images: GalleryImage[];
};

function Lightbox({
  images,
  selected,
  onSelect,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  selected: number;
  onSelect: (i: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const main = images[selected];

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between p-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/60 text-sm">
          {selected + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-circle text-white hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4 pb-4">
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 lg:left-6 z-10 btn btn-circle btn-sm lg:btn-md bg-white/10 hover:bg-white/20 border-0 text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
        <Image
          src={main.fullUrl}
          alt={main.alt}
          width={1200}
          height={1500}
          className="max-h-full max-w-full object-contain select-none"
          priority
          onClick={(e) => e.stopPropagation()}
        />

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 lg:right-6 z-10 btn btn-circle btn-sm lg:btn-md bg-white/10 hover:bg-white/20 border-0 text-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Bottom thumbnails */}
      {images.length > 1 && (
        <div
          className="flex gap-2 justify-center px-4 pb-4 shrink-0 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => onSelect(i)}
              className={`shrink-0 w-12 h-12 md:w-14 md:h-14 overflow-hidden border-2 transition-all ${
                i === selected
                  ? "border-white ring-1 ring-white/30 opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
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
    </div>,
    document.body
  );
}

export function ProductGallery({ images }: Props) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const goPrev = useCallback(() => {
    setSelected((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setSelected((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full bg-base-200 flex items-center justify-center">
        <span className="text-base-content/40">No image</span>
      </div>
    );
  }

  const main = images[selected];

  return (
    <>
      <div className="flex flex-col gap-px">
        {/* Main image — clickable to open lightbox */}
        <div
          onClick={openLightbox}
          className="relative aspect-square w-full overflow-hidden bg-base-200 cursor-zoom-in group/img"
          role="button"
          tabIndex={0}
          aria-label="View full image"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openLightbox(); }}
        >
          <Image
            src={main.url}
            alt={main.alt}
            width={800}
            height={1000}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
            priority
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-base-content/70" />
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-base-content/70" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="hidden md:flex gap-px overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelected(i)}
                className={`shrink-0 w-18 overflow-hidden transition-opacity ${
                  i === selected ? "opacity-100" : "opacity-50 hover:opacity-80"
                }`}
                style={{ aspectRatio: "1/1" }}
              >
                <Image
                  src={img.thumbUrl}
                  alt={img.alt}
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Mobile dots */}
        {images.length > 1 && (
          <div className="flex md:hidden gap-1.5 justify-center py-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === selected ? "bg-base-content" : "bg-base-content/25"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — rendered via portal to escape stacking contexts */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          selected={selected}
          onSelect={setSelected}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  );
}
