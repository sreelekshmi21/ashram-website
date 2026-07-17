export default function Founder() {
  return (
    <section id="founder" className="section-padding gradient-warm relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 mandala-pattern opacity-50" aria-hidden="true" />
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-saffron/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Our Founder
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark">
            The Guiding Light
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Portrait */}
          <div className="lg:col-span-2 reveal-left">
            <div className="relative max-w-sm mx-auto">
              {/* Decorative ring */}
              <div
                className="absolute -inset-4 rounded-full border-2 border-dashed border-gold/30"
                aria-hidden="true"
              />
              <div
                className="absolute -inset-8 rounded-full border border-gold/10"
                aria-hidden="true"
              />

              {/* Portrait frame */}
              <div
                className="relative rounded-full overflow-hidden aspect-square shadow-2xl shadow-forest/20 border-4 border-gold-light/40"
                style={{
                  background:
                    "linear-gradient(180deg, #F5A623 0%, #E8751A 40%, #C9A84C 100%)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl opacity-30">🙏</span>
                </div>
              </div>

              {/* Accent element */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-6 py-2 shadow-lg border border-gold-light/20">
                <p className="text-sm font-heading font-semibold text-forest-dark text-center">
                  1927 — 1999
                </p>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="lg:col-span-3 reveal-right">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-forest-dark mb-4">
              Navajyothi Sri Karunakara Guru
            </h3>

            <p className="text-warm-gray text-lg leading-relaxed mb-6">
              Navajyothi Sri Karunakara Guru, the illustrious founder of
              Santhigiri Ashram, was a visionary spiritual master whose
              teachings illuminated the path of righteousness for millions. Born
              in 1927 in Kerala, the Guru dedicated his life to spiritual
              realization and the upliftment of humanity.
            </p>

            <p className="text-warm-gray leading-relaxed mb-8">
              Through deep penance and divine communion, the Guru established a
              unique spiritual tradition that transcends caste, creed, and
              religion. His teachings emphasize the Guru-disciple tradition,
              dharmic living, and the transformative power of selfless service.
              The Ashram he founded continues to flourish as a testament to his
              extraordinary vision and boundless compassion.
            </p>

            {/* Quote */}
            <blockquote className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold-light/30 shadow-lg">
              {/* Quote mark */}
              <div
                className="absolute -top-4 left-6 w-10 h-10 gradient-saffron rounded-full flex items-center justify-center shadow-md"
                aria-hidden="true"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                </svg>
              </div>

              <p className="font-heading text-lg md:text-xl text-forest-dark italic leading-relaxed mt-2">
                &ldquo;The purpose of human birth is to realize the divine
                within and to serve humanity with love and compassion. This is
                the path to eternal peace and liberation.&rdquo;
              </p>
              <footer className="mt-4 flex items-center gap-3">
                <span className="h-px w-8 bg-gold" />
                <cite className="not-italic text-sm font-semibold text-saffron tracking-wide">
                  Navajyothi Sri Karunakara Guru
                </cite>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
