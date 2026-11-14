"use client";

import { useEffect, useState, useRef } from "react";
import { useScrollReveal } from "@/lib/animations";
import { galleryImages as staticImages } from "@/lib/constants";
import { type PublishedGalleryImage } from "@/lib/data";
import { IMAGE_CATEGORIES } from "@/lib/imageConfig";

const fallbackImages: PublishedGalleryImage[] = staticImages.map((img) => ({
  id: String(img.id),
  title: img.title,
  description: null,
  category: "Ashram & Temple",
  url: "",
  gradient: img.gradient,
  height: img.height,
  displayOrder: img.id,
}));

export default function Gallery() {
  const [imageList, setImageList] = useState<PublishedGalleryImage[]>(fallbackImages);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useScrollReveal([loading, selectedCategory, imageList.length]);

  useEffect(() => {
    async function loadImages() {
      try {
        setLoading(true);
        const url = selectedCategory === "All" ? "/api/gallery" : `/api/gallery?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setImageList(json.data);
        } else if (selectedCategory === "All") {
          setImageList(fallbackImages);
        } else {
          setImageList([]);
        }
      } catch (err) {
        console.warn("[Gallery] Failed to fetch dynamic gallery images, using static list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadImages();
  }, [selectedCategory]);

  const categories = ["All", ...IMAGE_CATEGORIES];

  return (
    <section id="gallery" className="section-padding gradient-warm relative overflow-hidden">
      <div className="absolute inset-0 mandala-pattern opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-12 reveal">
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

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-forest text-white shadow-md scale-105"
                    : "bg-white text-forest-dark border border-gold-light/40 hover:bg-gold-light/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry grid */}
        {imageList.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-gold-light/30">
            <p className="text-warm-gray text-lg">No images available in this category.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {imageList.map((img, index) => (
              <div
                key={img.id}
                className="reveal break-inside-avoid group cursor-pointer"
                style={{ transitionDelay: `${index * 60}ms` }}
                onClick={() => setLightbox(index)}
                role="button"
                tabIndex={0}
                aria-label={`View ${img.title}`}
                onKeyDown={(e) => e.key === "Enter" && setLightbox(index)}
              >
                <div
                  className={`relative ${img.height || "h-64"} rounded-2xl overflow-hidden shadow-md shadow-black/5 group-hover:shadow-xl transition-shadow duration-300 bg-forest-dark`}
                  style={{ background: img.gradient || undefined }}
                >
                  {img.url && (
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-forest-dark/0 group-hover:bg-forest-dark/50 transition-colors duration-300 flex items-center justify-center p-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 text-white">
                        <svg
                          className="w-6 h-6"
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
                      <p className="text-white text-sm font-semibold">{img.title}</p>
                      {img.description && (
                        <p className="text-white/80 text-xs mt-1 line-clamp-2 max-w-xs">{img.description}</p>
                      )}
                    </div>
                  </div>

                  {!img.url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-20">🛕</span>
                    </div>
                  )}

                  {/* Category tag */}
                  <div className="absolute top-3 left-3 bg-forest-dark/70 backdrop-blur-sm text-gold-light text-xs font-medium px-2.5 py-1 rounded-md">
                    {img.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && imageList[lightbox] && (
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
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2 text-2xl"
              aria-label="Close lightbox"
            >
              ✕
            </button>

            {/* Image display */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl aspect-video bg-black flex items-center justify-center"
              style={{ background: imageList[lightbox].gradient || "#000" }}
            >
              {imageList[lightbox].url ? (
                <img
                  src={imageList[lightbox].url}
                  alt={imageList[lightbox].title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl opacity-30">🛕</span>
                    <p className="text-white/60 mt-4 font-heading text-xl">
                      {imageList[lightbox].title}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description bar */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-white gap-2">
              <div>
                <h3 className="font-heading text-lg font-bold">{imageList[lightbox].title}</h3>
                {imageList[lightbox].description && (
                  <p className="text-sm text-white/70 max-w-xl">{imageList[lightbox].description}</p>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4 self-end sm:self-center">
                <button
                  onClick={() =>
                    setLightbox((lightbox - 1 + imageList.length) % imageList.length)
                  }
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-sm bg-white/10 px-3 py-1.5 rounded-lg"
                  aria-label="Previous image"
                >
                  ← Prev
                </button>
                <span className="text-white/60 text-sm font-medium">
                  {lightbox + 1} / {imageList.length}
                </span>
                <button
                  onClick={() =>
                    setLightbox((lightbox + 1) % imageList.length)
                  }
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-sm bg-white/10 px-3 py-1.5 rounded-lg"
                  aria-label="Next image"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
