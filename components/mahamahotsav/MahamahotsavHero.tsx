"use client";

import Image from "next/image";
import Link from "next/link";
import { mahamahotsavStats } from "@/lib/mahamahotsavData";

export default function MahamahotsavHero() {
  return (
    <section className="relative min-h-[550px] sm:min-h-[650px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-forest-dark select-none pt-20">
      {/* Background Image */}
      <Image
        src="/images/home/hero-evening.png"
        alt="Santhigiri Ashram Lotus Parnasala"
        fill
        priority
        className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/80 via-forest-dark/60 to-forest-dark/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/70 via-transparent to-forest-dark/70" />
      <div className="absolute inset-0 mandala-pattern opacity-25" />

      {/* Glowing Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-saffron/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* Top Centenary Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold-light/40 text-gold-light text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-6 shadow-lg shadow-gold/10 animate-fade-in">
          <span className="text-saffron">🪷</span>
          <span>100th Birth Anniversary Celebrations • 1927 - 2027</span>
        </div>

        {/* Main Title */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-md">
          Janmashatabdi{" "}
          <span className="bg-gradient-to-r from-gold-light via-saffron-light to-gold bg-clip-text text-transparent">
            Mahamahotsav
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
          A historic year-long global celebration dedicated to the divine life, spiritual illumination, and universal message of{" "}
          <span className="text-gold-light font-semibold">Navajyothi Sri Karunakara Guru</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#programme"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 gradient-saffron text-white font-bold text-base rounded-full shadow-xl shadow-saffron/30 hover:shadow-saffron/50 hover:-translate-y-0.5 transition-all duration-300 border border-gold-light/30"
          >
            <span>Explore Programme &amp; Events</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>

          <a
            href="#venue-contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold text-base rounded-full border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300"
          >
            <span>Plan Your Visit</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {mahamahotsavStats.map((stat, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shadow-lg text-center hover:border-gold-light/40 transition-colors"
            >
              <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gold-light mb-1">
                {stat.value}
              </div>
              <div className="text-white text-xs sm:text-sm font-semibold">
                {stat.label}
              </div>
              <div className="text-white/60 text-[11px] sm:text-xs mt-0.5">
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Bottom Wave/Border */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-ivory clip-path-curve" />
    </section>
  );
}
