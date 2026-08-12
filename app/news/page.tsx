import { getNewsItems } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest News & Announcements | Santhigiri Ashram",
  description:
    "Stay informed about the latest happenings, milestones, celebrations, and announcements from Santhigiri Ashram.",
};

export default async function NewsListPage() {
  const newsList = await getNewsItems();

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 gradient-warm min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center my-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-8 bg-saffron" />
              <span className="text-saffron text-sm font-semibold tracking-[0.2em] uppercase">
                Ashram Updates
              </span>
              <span className="h-px w-8 bg-saffron" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-forest-dark mb-4">
              News &amp; Announcements
            </h1>
            <p className="text-warm-gray text-lg max-w-2xl mx-auto">
              Read the latest stories, press releases, research updates, and spiritual event highlights from Santhigiri Ashram.
            </p>
          </div>

          {/* Grid */}
          {newsList.length === 0 ? (
            <div className="text-center py-16 bg-white/70 rounded-3xl border border-gold-light/20 max-w-lg mx-auto shadow-sm">
              <p className="text-warm-gray text-lg">
                No published news articles at the moment. Please check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {newsList.map((item) => (
                <article
                  key={item.id || item.slug}
                  className="group bg-white rounded-2xl overflow-hidden border border-gold-light/20 shadow-md shadow-black/5 card-hover flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block px-3 py-1 bg-cream rounded-full text-xs font-semibold text-saffron tracking-wide uppercase">
                        {item.category}
                      </span>
                      <time className="text-xs text-warm-gray-light">
                        {item.formattedDate}
                      </time>
                    </div>

                    <h2 className="font-heading text-xl font-bold text-forest-dark mb-3 group-hover:text-saffron transition-colors duration-300 leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-warm-gray text-sm leading-relaxed mb-4">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href={`/news/${item.slug}`}
                      className="inline-flex items-center gap-2 text-saffron font-semibold text-sm hover:text-saffron-dark transition-colors group/link"
                    >
                      Read Full Article
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
                    </Link>
                    <div className="h-1 gradient-saffron opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4 -mx-6 -mb-6" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
