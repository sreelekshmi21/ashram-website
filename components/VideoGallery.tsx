import { videos } from "@/lib/constants";

export default function VideoGallery() {
  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16 reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-saffron" />
            <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
              Watch & Learn
            </span>
            <span className="h-px w-8 bg-saffron" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-4">
            Video Gallery
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto">
            Explore our collection of spiritual discourses, meditation guides,
            and documentary films.
          </p>
        </div>

        {/* Video cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="reveal group bg-white rounded-2xl overflow-hidden border border-gold-light/20 shadow-sm card-hover"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Video thumbnail */}
              <div
                className="relative aspect-video"
                style={{ background: video.gradient }}
              >
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    aria-label={`Play ${video.title}`}
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg"
                  >
                    <svg
                      className="w-7 h-7 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
                  {video.duration}
                </div>
              </div>

              {/* Video info */}
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-forest-dark group-hover:text-saffron transition-colors duration-300 leading-snug">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
