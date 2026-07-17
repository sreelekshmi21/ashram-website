export default function About() {
  return (
    <section id="about" className="section-padding bg-ivory">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image placeholder */}
          <div className="reveal-left">
            <div className="relative">
              {/* Main image */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl shadow-saffron/10 aspect-[4/3]"
                style={{
                  background:
                    "linear-gradient(135deg, #2D5A3D 0%, #3D7A53 30%, #C9A84C 60%, #F5A623 100%)",
                }}
              >
                {/* Decorative overlay pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 40%),
                                      radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
                  }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl opacity-40">🏛️</span>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-gold-light/20 hidden md:block">
                <div className="text-center">
                  <p className="text-3xl font-heading font-bold text-saffron">60+</p>
                  <p className="text-sm text-warm-gray font-medium">Years of Service</p>
                </div>
              </div>

              {/* Decorative border */}
              <div
                className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-gold/40 rounded-tl-2xl"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Content */}
          <div className="reveal-right">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-saffron" />
              <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
                About Us
              </span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark leading-tight mb-6">
              A Sacred Abode of{" "}
              <span className="text-gradient-saffron">Spiritual Wisdom</span>
            </h2>

            <p className="text-warm-gray text-lg leading-relaxed mb-6">
              Santhigiri Ashram, founded in 1964 in Thiruvananthapuram, Kerala,
              is a renowned spiritual institution dedicated to the holistic
              upliftment of humanity. Rooted in the timeless wisdom of India's
              spiritual heritage, the Ashram serves as a beacon of light for
              seekers from around the world.
            </p>

            <p className="text-warm-gray leading-relaxed mb-8">
              The Ashram integrates spiritual practice, Ayurvedic healing,
              education, and charitable service into a unified vision of
              universal well-being. Through its diverse programs and
              initiatives, Santhigiri continues to inspire millions on the path
              of righteousness, compassion, and inner transformation.
            </p>

            {/* Key highlights */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { value: "500+", label: "Branches Worldwide" },
                { value: "10M+", label: "Lives Touched" },
                { value: "200+", label: "Charitable Projects" },
                { value: "50+", label: "Countries Reached" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-cream rounded-xl p-4 text-center border border-gold-light/20"
                >
                  <p className="text-2xl font-heading font-bold text-saffron">
                    {stat.value}
                  </p>
                  <p className="text-sm text-warm-gray mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <a
              href="#founder"
              className="group inline-flex items-center gap-2 px-6 py-3 gradient-saffron text-white font-semibold rounded-full shadow-lg shadow-saffron/20 hover:shadow-xl hover:shadow-saffron/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Learn More
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
