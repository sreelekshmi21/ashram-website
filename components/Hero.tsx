import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 gradient-hero animate-gradient-shift"
        aria-hidden="true"
      />

      {/* Decorative overlays */}
      <div className="absolute inset-0 mandala-pattern" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"
        aria-hidden="true"
      />

      {/* Floating decorative elements */}
      <div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-saffron/10 blur-3xl animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-32 right-16 w-48 h-48 rounded-full bg-gold/10 blur-3xl animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-white/5 blur-2xl animate-pulse-soft"
        aria-hidden="true"
      />

      {/* Decorative mandala ring */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full border border-white/5 animate-spin-slow"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[650px] md:h-[650px] rounded-full border border-gold/10 animate-spin-slow"
        style={{ animationDirection: "reverse", animationDuration: "30s" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* OM symbol */}
        <div className="mb-6 animate-fade-in">
          <span className="inline-block text-5xl md:text-6xl opacity-80">🙏</span>
        </div>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-light" />
          <span className="text-gold-light text-sm tracking-[0.3em] uppercase font-body font-medium">
            A Spiritual Sanctuary
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-light" />
        </div>

        {/* Main heading */}
        <h1
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          Welcome to{" "}
          <span className="block mt-2 bg-gradient-to-r from-gold-light via-saffron-light to-gold bg-clip-text text-transparent">
            Santhigiri Ashram
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          A sacred abode of spiritual wisdom, holistic healing, and selfless
          service — guiding seekers toward inner peace, divine knowledge, and
          universal harmony since 1964.
        </p>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.7s" }}
        >
          <a
            href="#about"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 gradient-saffron text-white font-semibold rounded-full shadow-lg shadow-saffron/30 hover:shadow-xl hover:shadow-saffron/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            Explore
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
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/60 transition-all duration-300"
          >
            Donate
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: "1s" }}>
        <a
          href="#about"
          aria-label="Scroll down"
          className="flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  );
}
