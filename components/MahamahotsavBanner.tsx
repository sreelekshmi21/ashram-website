"use client";

import Link from "next/link";

export default function MahamahotsavBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-forest-dark via-forest to-forest-dark py-10 px-4 sm:px-6 lg:px-8 shadow-xl border-y border-gold/30 select-none">
      {/* Background mandala & gradient accents */}
      <div className="absolute inset-0 mandala-pattern opacity-20 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-saffron/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gold/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left side: Emblem badge + text */}
        <div className="flex flex-col sm:flex-row items-center lg:items-start text-center sm:text-left gap-5">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-saffron flex items-center justify-center text-3xl shadow-lg shadow-saffron/30 shrink-0 border-2 border-gold-light/40 animate-pulse-soft">
            🪷
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold-light/40 text-gold-light text-xs font-semibold tracking-widest uppercase mb-2">
              <span>✨</span>
              <span>1927 — 2027 Birth Centenary</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white leading-tight">
              Janmashatabdi Mahamahotsav
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              Celebrating 100 years of the divine legacy, spiritual wisdom, and global mission of Navajyothi Sri Karunakara Guru.
            </p>
          </div>
        </div>

        {/* Right side: Action button */}
        <div className="shrink-0">
          <Link
            href="/janmashatabdi-mahamahotsav"
            className="group inline-flex items-center gap-3 px-7 py-3.5 gradient-saffron text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-saffron/30 hover:shadow-xl hover:shadow-saffron/40 hover:-translate-y-0.5 transition-all duration-300 border border-gold-light/30"
          >
            <span>Explore Mahamahotsav</span>
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
