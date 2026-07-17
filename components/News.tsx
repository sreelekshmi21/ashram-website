import { news } from "@/lib/constants";

export default function News() {
  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Stay Updated
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Latest News
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Stay informed about the latest happenings, milestones, and
            announcements from Santhigiri Ashram.
          </p>
        </div>

        {/* News grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <article
              key={item.title}
              className="reveal group bg-white rounded-2xl overflow-hidden border border-gold-light/20 shadow-sm card-hover"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Category & date header */}
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 bg-cream rounded-full text-xs font-semibold text-saffron tracking-wide uppercase">
                    {item.category}
                  </span>
                  <time className="text-xs text-warm-gray-light">{item.date}</time>
                </div>

                <h3 className="font-heading text-xl font-bold text-forest-dark mb-3 group-hover:text-saffron transition-colors duration-300 leading-snug">
                  {item.title}
                </h3>

                <p className="text-warm-gray text-sm leading-relaxed">
                  {item.excerpt}
                </p>
              </div>

              {/* Footer */}
              <div className="p-6 pt-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-saffron font-semibold text-sm hover:text-saffron-dark transition-colors group/link"
                >
                  Read More
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
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

              {/* Bottom accent */}
              <div className="h-1 gradient-saffron opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
