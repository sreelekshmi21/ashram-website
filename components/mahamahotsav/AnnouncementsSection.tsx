"use client";

import { mahamahotsavAnnouncements, Announcement } from "@/lib/mahamahotsavData";

export default function AnnouncementsSection() {
  return (
    <section id="announcements" className="section-padding bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Latest Bulletins
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Official Announcements
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Stay updated with vital guidelines, pilgrim registration notices, press releases, and centenary announcements.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mahamahotsavAnnouncements.map((ann: Announcement) => (
            <div
              key={ann.id}
              className={`rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${
                ann.isImportant
                  ? "bg-gradient-to-br from-saffron/10 via-cream to-white border-saffron/40 shadow-lg shadow-saffron/5"
                  : "bg-ivory/60 border-gold-light/30 shadow-sm hover:border-gold-light/60 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-saffron bg-saffron/10 px-3 py-1 rounded-full">
                  {ann.category}
                </span>
                <span className="text-xs font-medium text-warm-gray">{ann.date}</span>
              </div>

              <h3 className="font-heading text-xl font-bold text-forest-dark mb-3 leading-snug">
                {ann.title}
              </h3>

              <p className="text-warm-gray text-sm leading-relaxed mb-6">
                {ann.summary}
              </p>

              {ann.linkText && (
                <a
                  href="#venue-contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-saffron hover:text-saffron-dark transition-colors"
                >
                  <span>{ann.linkText}</span>
                  <span>→</span>
                </a>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
