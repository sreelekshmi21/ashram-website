"use client";

import { useState } from "react";
import { galleryImages } from "@/lib/constants";

export default function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="gallery" className="section-padding gradient-warm relative overflow-hidden">
      <div className="absolute inset-0 mandala-pattern opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Visual Journey
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Image Gallery
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Glimpses of life, devotion, and sacred moments at Santhigiri Ashram.
          </p>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {galleryImages.map((img, index) => (
            <div
              key={img.id}
              className="reveal break-inside-avoid group cursor-pointer"
              style={{ transitionDelay: `${index * 80}ms` }}
              onClick={() => setLightbox(index)}
              role="button"
              tabIndex={0}
              aria-label={`View ${img.title}`}
              onKeyDown={(e) => e.key === "Enter" && setLightbox(index)}
            >
              <div
                className={`relative ${img.height} rounded-2xl overflow-hidden shadow-md shadow-black/5 group-hover:shadow-xl transition-shadow duration-300`}
                style={{ background: img.gradient }}
              >
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-forest-dark/0 group-hover:bg-forest-dark/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">{img.title}</p>
                  </div>
                </div>

                {/* Decorative icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-20">🏛️</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-forest-dark/90 backdrop-blur-md"
            onClick={() => setLightbox(null)}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative max-w-4xl w-full">
            {/* Close button */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
              aria-label="Close lightbox"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl aspect-video"
              style={{ background: galleryImages[lightbox].gradient }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl opacity-30">🏛️</span>
                  <p className="text-white/60 mt-4 font-heading text-xl">
                    {galleryImages[lightbox].title}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() =>
                  setLightbox((lightbox - 1 + galleryImages.length) % galleryImages.length)
                }
                className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <span className="text-white/50 text-sm">
                {lightbox + 1} / {galleryImages.length}
              </span>
              <button
                onClick={() =>
                  setLightbox((lightbox + 1) % galleryImages.length)
                }
                className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                aria-label="Next image"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
