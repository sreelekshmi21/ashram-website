import Link from "next/link";

export default function DonationCTA() {
  return (
    <section id="donate" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-saffron-gold" aria-hidden="true" />

      {/* Decorative patterns */}
      <div className="absolute inset-0 mandala-pattern" aria-hidden="true" />
      <div
        className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/3"
        aria-hidden="true"
      />

      {/* Floating decorative elements */}
      <div
        className="absolute top-10 right-20 w-16 h-16 border-2 border-white/10 rounded-full animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-20 w-12 h-12 border border-white/10 rounded-full animate-float-slow"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Icon */}
        <div className="mb-6 reveal">
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="reveal font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Support Our Sacred Mission
        </h2>

        <p className="reveal text-white/85 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Your generous contribution helps sustain the Ashram&apos;s spiritual
          programs, charitable initiatives, Ayurvedic treatments, and
          educational outreach that touch millions of lives worldwide.
        </p>

        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/donate"
            className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-saffron font-bold rounded-full shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Donate Now
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Link>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/60 transition-all duration-300"
          >
            Learn How to Help
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex items-center justify-center gap-8 text-white/60 text-sm reveal">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Tax Deductible
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            100% Secure
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Transparent
          </div>
        </div>
      </div>
    </section>
  );
}
