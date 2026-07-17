import { publications } from "@/lib/constants";

export default function Publications() {
  return (
    <section id="publications" className="section-padding gradient-warm relative overflow-hidden">
      <div className="absolute inset-0 mandala-pattern opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Sacred Texts
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Publications
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Dive into our spiritual literature, research papers, and sacred
            texts authored by revered masters.
          </p>
        </div>

        {/* Publications scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {publications.map((pub, index) => (
            <div
              key={pub.title}
              className="reveal group card-hover"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Book cover */}
              <div
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mb-4"
                style={{ background: pub.gradient }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-4 opacity-40">📖</span>
                  <h4 className="font-heading text-lg font-bold text-white leading-snug">
                    {pub.title}
                  </h4>
                  <p className="text-white/60 text-sm mt-2">{pub.author}</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-forest-dark/0 group-hover:bg-forest-dark/60 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-forest-dark text-sm font-semibold shadow-lg">
                    Read More
                  </span>
                </div>
              </div>

              {/* Book info */}
              <h3 className="font-heading text-base font-bold text-forest-dark group-hover:text-saffron transition-colors duration-300 leading-snug mb-1">
                {pub.title}
              </h3>
              <p className="text-warm-gray text-xs">{pub.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
