import { activities } from "@/lib/constants";

export default function Activities() {
  return (
    <section id="activities" className="section-padding bg-ivory relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute bottom-0 left-0 w-72 h-72 bg-forest/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              What We Do
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Our Activities
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Discover the diverse spiritual, healing, and community service
            activities offered at Santhigiri Ashram.
          </p>
        </div>

        {/* Activity cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {activities.map((activity, index) => (
            <div
              key={activity.title}
              className="reveal group relative bg-white rounded-2xl p-6 lg:p-8 border border-gold-light/20 shadow-sm card-hover"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl gradient-saffron flex items-center justify-center text-2xl mb-5 shadow-md shadow-saffron/20 group-hover:scale-110 transition-transform duration-300">
                {activity.icon}
              </div>

              {/* Content */}
              <h3 className="font-heading text-xl font-bold text-forest-dark mb-3 group-hover:text-saffron transition-colors duration-300">
                {activity.title}
              </h3>
              <p className="text-warm-gray leading-relaxed text-sm">
                {activity.description}
              </p>

              {/* Hover accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 gradient-saffron rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
