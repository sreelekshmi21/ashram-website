import Link from "next/link";
import { events } from "@/lib/constants";

export default function Events() {
  return (
    <section id="events" className="section-padding gradient-warm relative overflow-hidden">
      <div className="absolute inset-0 mandala-pattern opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Mark Your Calendar
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Upcoming Events
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Join us in our upcoming celebrations, retreats, and community gatherings.
          </p>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <article
              key={event.title}
              className="reveal group bg-white rounded-2xl overflow-hidden shadow-md shadow-black/5 card-hover border border-gold-light/10"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Event image header */}
              <div
                className={`relative h-48 bg-gradient-to-br ${event.gradient}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl opacity-30">📅</span>
                </div>

                {/* Date badge */}
                <div className="absolute top-4 left-4 bg-white rounded-xl p-2.5 shadow-lg text-center min-w-[60px]">
                  <p className="text-2xl font-heading font-bold text-saffron leading-none">
                    {event.day}
                  </p>
                  <p className="text-xs font-semibold text-forest-dark uppercase tracking-wider mt-1">
                    {event.month}
                  </p>
                </div>

                {/* Fee badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
                  <p className="text-xs font-bold text-forest-dark">
                    {event.fee > 0 ? `₹${event.fee.toLocaleString("en-IN")}` : "Free"}
                  </p>
                </div>
              </div>

              {/* Event details */}
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-forest-dark mb-3 group-hover:text-saffron transition-colors duration-300">
                  {event.title}
                </h3>
                <p className="text-warm-gray text-sm leading-relaxed mb-5">
                  {event.description}
                </p>
                <Link
                  href={`/register/${event.slug}`}
                  className="inline-flex items-center gap-2 text-saffron font-semibold text-sm hover:text-saffron-dark transition-colors group/btn"
                >
                  Register Now
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

