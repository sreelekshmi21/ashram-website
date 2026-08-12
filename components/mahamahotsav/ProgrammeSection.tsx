"use client";

import { useState } from "react";
import { programmeEvents, ProgrammeEvent } from "@/lib/mahamahotsavData";

type CategoryFilter = "All" | "Spiritual" | "Cultural" | "Health" | "Youth" | "Global";

export default function ProgrammeSection() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");

  const filteredEvents = programmeEvents.filter(
    (evt) => selectedCategory === "All" || evt.category === selectedCategory
  );

  const categories: CategoryFilter[] = ["All", "Spiritual", "Cultural", "Health", "Youth", "Global"];

  return (
    <section id="programme" className="section-padding gradient-warm relative overflow-hidden">
      <div className="absolute inset-0 mandala-pattern opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Schedule &amp; Events
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Mahamahotsav Programme
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Explore the flagship conclaves, spiritual retreats, medical expos, and cultural celebrations of the Centenary year.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-forest-dark text-white shadow-lg shadow-forest-dark/20 scale-105"
                  : "bg-white text-warm-gray border border-gold-light/40 hover:bg-cream hover:text-forest-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt: ProgrammeEvent) => (
            <article
              key={evt.id}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gold-light/20 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300"
            >
              {/* Top Banner Gradient */}
              <div className={`relative p-6 bg-gradient-to-br ${evt.gradient} text-white`}>
                {evt.featured && (
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-forest-dark text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                    ⭐ Key Highlight
                  </span>
                )}
                <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 bg-black/20 rounded-full mb-3">
                  {evt.category}
                </span>
                <h3 className="font-heading text-xl font-bold leading-snug">
                  {evt.title}
                </h3>
              </div>

              {/* Event Info */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-saffron text-sm font-bold mb-2">
                    <span>📅</span>
                    <span>{evt.date}</span>
                    <span className="text-warm-gray-light">•</span>
                    <span>{evt.time}</span>
                  </div>

                  <p className="text-xs font-semibold text-forest-dark mb-4 flex items-center gap-1.5">
                    <span>📍</span>
                    <span>{evt.venue}</span>
                  </p>

                  <p className="text-warm-gray text-sm leading-relaxed mb-6">
                    {evt.description}
                  </p>
                </div>

                {evt.speaker && (
                  <div className="pt-4 border-t border-gold-light/20 flex items-center justify-between text-xs">
                    <span className="text-warm-gray font-medium">Lead Presider:</span>
                    <span className="font-semibold text-forest-dark">{evt.speaker}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
