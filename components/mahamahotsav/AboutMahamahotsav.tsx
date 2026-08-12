"use client";

import Image from "next/image";

export default function AboutMahamahotsav() {
  return (
    <section id="about-mahamahotsav" className="section-padding bg-ivory relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Centenary Significance
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            About Janmashatabdi Mahamahotsav
          </h2>
          <p className="text-warm-gray text-lg max-w-3xl mx-auto leading-relaxed">
            Honoring a century of spiritual awakening, compassionate service, and universal oneness guided by the divine vision of Navajyothi Sri Karunakara Guru.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Left Column: Visual Highlight Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-md w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/home/lotus1.png"
                alt="Sacred Lotus Parnasala at Santhigiri"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/90 via-forest-dark/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="inline-block px-3 py-1 bg-saffron text-white text-xs font-bold rounded-full mb-3 shadow-md">
                  1927 – 2027 Centenary
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">
                  The Lotus of Truth &amp; Light
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  The 91-foot Lotus Parnasala stands as a monumental symbol of global peace and spiritual purity.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gold-light/20">
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-forest-dark mb-4 leading-tight">
                A Century of Divine Grace &amp; Humanitarian Mission
              </h3>
              
              <p className="text-warm-gray text-base leading-relaxed mb-4">
                <strong className="text-forest-dark font-semibold">Navajyothi Sri Karunakara Guru</strong> devoted his life to restoring spiritual authenticity, harmony among faiths, and holistic healing for all humanity. The <span className="text-saffron font-semibold">Janmashatabdi Mahamahotsav</span> commemorates the centenary of Guru&apos;s holy birth, marking a historic epoch in spiritual history.
              </p>

              <p className="text-warm-gray text-base leading-relaxed mb-6">
                Over this year-long celebration, seekers from across the globe gather at Santhigiri Ashram to partake in continuous prayer, mass Pushpanjali offerings, scientific healthcare summits, interfaith dialogues, and cultural symphonies.
              </p>

              {/* Pillars list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gold-light/20 pt-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🕉️</span>
                  <div>
                    <h4 className="font-bold text-forest-dark text-sm">Spiritual Renewal</h4>
                    <p className="text-xs text-warm-gray">Deepening devotion and universal prayer</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <h4 className="font-bold text-forest-dark text-sm">Holistic Healthcare</h4>
                    <p className="text-xs text-warm-gray">Ayurvedic research &amp; free medical camps</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <h4 className="font-bold text-forest-dark text-sm">Universal Brotherhood</h4>
                    <p className="text-xs text-warm-gray">Interfaith peace &amp; social harmony</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">💛</span>
                  <div>
                    <h4 className="font-bold text-forest-dark text-sm">Selfless Service</h4>
                    <p className="text-xs text-warm-gray">Annadanam &amp; community outreach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
