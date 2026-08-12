import { getNewsBySlug } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    return {
      title: "News Article Not Found | Santhigiri Ashram",
    };
  }

  return {
    title: `${item.title} | Santhigiri Ashram News`,
    description: item.excerpt,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 gradient-warm min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <div className="my-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-saffron font-semibold text-sm hover:text-saffron-dark transition-colors"
            >
              ← Back to News &amp; Announcements
            </Link>
          </div>

          {/* Article Header Card */}
          <article className="bg-white rounded-3xl p-8 sm:p-12 border border-gold-light/20 shadow-xl shadow-black/5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gold-light/20">
              <span className="inline-block px-3.5 py-1 bg-cream rounded-full text-xs font-semibold text-saffron uppercase tracking-wide">
                {item.category}
              </span>
              <time className="text-sm font-medium text-warm-gray">
                {item.formattedDate}
              </time>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-dark mb-6 leading-tight">
              {item.title}
            </h1>

            {/* Excerpt callout */}
            <div className="bg-cream/50 border-l-4 border-saffron rounded-r-xl p-5 mb-8">
              <p className="text-forest-dark text-lg font-medium leading-relaxed italic">
                "{item.excerpt}"
              </p>
            </div>

            {/* Content Body */}
            <div className="prose prose-lg max-w-none text-warm-gray leading-relaxed space-y-6">
              {item.content ? (
                item.content.split("\n\n").map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p>{item.excerpt}</p>
              )}
            </div>

            {/* Footer actions */}
            <div className="mt-12 pt-8 border-t border-gold-light/20 flex items-center justify-between">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-forest-dark font-semibold text-sm hover:text-saffron transition-colors"
              >
                ← View all news
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
