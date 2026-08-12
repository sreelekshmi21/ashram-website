"use client";

import { useState } from "react";
import { galleryItems, GalleryItem } from "@/lib/mahamahotsavData";

type CategoryFilter = "All" | "Historical" | "Parnasala" | "Cultural" | "Rituals";

export default function MahamahotsavGallery() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  const categories: CategoryFilter[] = ["All", "Parnasala", "Historical", "Cultural", "Rituals"];

  return (
    <section id="gallery-section" className="section-padding gradient-warm relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Visual Journey
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Mahamahotsav Media Gallery
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Witness the sacred moments, architectural splendor, and vibrant devotional gatherings celebrating the Centenary.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-saffron text-white shadow-md shadow-saffron/20"
                  : "bg-white text-warm-gray border border-gold-light/40 hover:bg-cream hover:text-forest-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-gold-light/20 cursor-pointer select-none"
              style={{ background: item.gradient }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <span className="text-5xl mb-3 opacity-60 transition-transform duration-500 group-hover:scale-125">
                  {item.icon}
                </span>
                <h3 className="font-heading text-xl font-bold mb-1 leading-snug">
                  {item.title}
                </h3>
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                  {item.category}
                </span>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-forest-dark/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center text-white">
                <span className="text-sm font-semibold mb-2">Click to View Details</span>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="h-56 flex flex-col items-center justify-center p-6 text-center text-white relative"
              style={{ background: selectedImage.gradient }}
            >
              <span className="text-6xl mb-2">{selectedImage.icon}</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold bg-black/30 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <span className="inline-block px-3 py-1 bg-saffron/10 text-saffron text-xs font-bold uppercase rounded-full mb-3">
                {selectedImage.category}
              </span>
              <h3 className="font-heading text-2xl font-bold text-forest-dark mb-2">
                {selectedImage.title}
              </h3>
              <p className="text-warm-gray text-sm leading-relaxed mb-6">
                {selectedImage.caption}
              </p>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-full py-3 bg-forest-dark text-white font-semibold rounded-full hover:bg-forest transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
