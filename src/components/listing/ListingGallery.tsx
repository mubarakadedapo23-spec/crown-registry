"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface Props {
  images: { url: string; alt?: string }[];
  title: string;
}

export function ListingGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-crown-obsidian-light flex items-center justify-center">
        <span className="text-6xl opacity-10">◆</span>
      </div>
    );
  }

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative aspect-[16/9] bg-crown-obsidian-light overflow-hidden group">
          <Image
            src={images[active].url}
            alt={images[active].alt ?? title}
            fill
            className="object-cover"
            priority
          />

          {/* Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 glass-card
                           flex items-center justify-center opacity-0 group-hover:opacity-100
                           transition-opacity hover:border-crown-gold/50"
              >
                <ChevronLeft className="w-5 h-5 text-crown-ivory" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 glass-card
                           flex items-center justify-center opacity-0 group-hover:opacity-100
                           transition-opacity hover:border-crown-gold/50"
              >
                <ChevronRight className="w-5 h-5 text-crown-ivory" />
              </button>
            </>
          )}

          {/* Fullscreen */}
          <button
            onClick={() => setLightbox(true)}
            className="absolute top-3 right-3 w-8 h-8 glass-card flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="w-3.5 h-3.5 text-crown-ivory" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 glass-card px-3 py-1.5">
              <span className="font-sans text-[9px] tracking-widest text-crown-ash">
                {active + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative w-20 h-16 shrink-0 overflow-hidden border-2 transition-all
                             ${i === active ? "border-crown-gold" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <Image src={img.url} alt={img.alt ?? `Image ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
             onClick={() => setLightbox(false)}>
          <button
            className="absolute top-4 right-4 w-10 h-10 border border-crown-gold/30
                       flex items-center justify-center text-crown-ash hover:text-crown-gold z-10"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 border
                           border-crown-gold/30 flex items-center justify-center text-crown-ash
                           hover:text-crown-gold z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 border
                           border-crown-gold/30 flex items-center justify-center text-crown-ash
                           hover:text-crown-gold z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active].url}
              alt={images[active].alt ?? title}
              width={1200}
              height={800}
              className="object-contain max-h-[85vh] w-auto mx-auto"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-sans text-[9px]
                          tracking-widest text-crown-ash">
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
