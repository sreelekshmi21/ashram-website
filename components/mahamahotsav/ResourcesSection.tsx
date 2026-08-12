"use client";

import Link from "next/link";
import { resourceItems, ResourceItem } from "@/lib/mahamahotsavData";

export default function ResourcesSection() {
  return (
    <section id="resources" className="section-padding bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Centenary Collectibles
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Related Resources &amp; Publications
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Access commemorative volumes, centenary music, documentary films, and official souvenirs.
          </p>
        </div>

        {/* Resources Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resourceItems.map((res: ResourceItem) => (
            <div
              key={res.id}
              className="bg-ivory rounded-3xl p-6 border border-gold-light/30 shadow-md flex flex-col justify-between group hover:shadow-xl hover:border-gold-light/60 transition-all duration-300"
            >
              <div>
                {/* Header Icon Card */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-md text-white"
                  style={{ background: res.gradient }}
                >
                  {res.icon}
                </div>

                <span className="inline-block px-2.5 py-1 bg-saffron/10 text-saffron text-[11px] font-bold uppercase rounded-full mb-3">
                  {res.type}
                </span>

                <h3 className="font-heading text-lg font-bold text-forest-dark mb-2 leading-snug">
                  {res.title}
                </h3>

                <p className="text-warm-gray text-xs leading-relaxed mb-6">
                  {res.description}
                </p>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-gold-dark mb-4">
                  🏷️ {res.badge}
                </span>

                <Link
                  href="/#publications"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gold-light/50 text-forest-dark text-xs font-bold rounded-full hover:bg-forest-dark hover:text-white transition-colors"
                >
                  <span>Explore Resource</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
