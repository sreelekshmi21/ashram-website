/**
 * Server-side cached data functions.
 *
 * Each function uses the Next.js 16 `use cache` directive to cache its return
 * value in Redis (via the custom cache handler). Tags allow on-demand
 * invalidation with `updateTag()` from server actions or API routes.
 */

import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  events,
  news,
  publications,
  galleryImages,
  activities,
  testimonials,
  videos,
} from "@/lib/constants";

// ── Helper to format date safely ────────────────────────────────────────────
function formatDateString(dateVal: Date | string | null | undefined): string {
  if (!dateVal) return "";
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Events (database-backed with fallback) ──────────────────────────────────

/**
 * Fetch all published events, ordered by start date.
 * Cached with tag "events" for on-demand invalidation.
 */
export async function getPublishedEvents(category?: string) {
  "use cache";
  cacheLife("content");
  cacheTag("events");

  const validCategories = ["MONTHLY", "YEARLY", "SPECIAL"];
  const whereClause: { status: "Published"; category?: "MONTHLY" | "YEARLY" | "SPECIAL" } = {
    status: "Published",
  };

  if (category && validCategories.includes(category.toUpperCase())) {
    whereClause.category = category.toUpperCase() as "MONTHLY" | "YEARLY" | "SPECIAL";
  }

  try {
    const dbEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        venue: true,
        startDate: true,
        endDate: true,
        registrationRequired: true,
        registrationFee: true,
        registrationDeadline: true,
        status: true,
        category: true,
        gradient: true,
      },
    });

    if (dbEvents && dbEvents.length > 0) {
      return dbEvents.map((e) => ({
        ...e,
        registrationFee: Number(e.registrationFee),
        startDate: e.startDate instanceof Date ? e.startDate.toISOString() : String(e.startDate),
        endDate: e.endDate ? (e.endDate instanceof Date ? e.endDate.toISOString() : String(e.endDate)) : null,
        registrationDeadline: e.registrationDeadline
          ? e.registrationDeadline instanceof Date
            ? e.registrationDeadline.toISOString()
            : String(e.registrationDeadline)
          : null,
      }));
    }
  } catch (error) {
    console.warn(
      "[lib/data] Database unavailable for getPublishedEvents, using static fallback:",
      error instanceof Error ? error.message : error
    );
  }

  return events.map((e) => ({
    id: e.slug,
    title: e.title,
    slug: e.slug,
    description: e.description,
    coverImage: null as string | null,
    venue: "Santhigiri Ashram",
    startDate: new Date(e.date).toISOString(),
    endDate: new Date(e.date).toISOString(),
    registrationRequired: false,
    registrationFee: e.fee,
    registrationDeadline: null as string | null,
    status: "Published",
    category: "SPECIAL",
    gradient: e.gradient,
  }));
}

/**
 * Fetch a single event by slug.
 * Each slug produces a separate cache entry (slug is part of the cache key).
 */
export async function getEventBySlug(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("events", `event:${slug}`);

  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        venue: true,
        startDate: true,
        endDate: true,
        registrationRequired: true,
        registrationFee: true,
        registrationDeadline: true,
        status: true,
        category: true,
        gradient: true,
      },
    });

    if (event) {
      return {
        ...event,
        registrationFee: Number(event.registrationFee),
        startDate: event.startDate instanceof Date ? event.startDate.toISOString() : String(event.startDate),
        endDate: event.endDate
          ? event.endDate instanceof Date
            ? event.endDate.toISOString()
            : String(event.endDate)
          : null,
        registrationDeadline: event.registrationDeadline
          ? event.registrationDeadline instanceof Date
            ? event.registrationDeadline.toISOString()
            : String(event.registrationDeadline)
          : null,
      };
    }
  } catch (error) {
    console.warn(
      `[lib/data] Database unavailable for getEventBySlug(${slug}), using static fallback:`,
      error instanceof Error ? error.message : error
    );
  }

  const staticEvent = events.find((e) => e.slug === slug);
  if (!staticEvent) return null;

  return {
    id: staticEvent.slug,
    title: staticEvent.title,
    slug: staticEvent.slug,
    description: staticEvent.description,
    coverImage: null as string | null,
    venue: "Santhigiri Ashram",
    startDate: new Date(staticEvent.date).toISOString(),
    endDate: new Date(staticEvent.date).toISOString(),
    registrationRequired: false,
    registrationFee: staticEvent.fee,
    registrationDeadline: null as string | null,
    status: "Published",
    category: "SPECIAL",
    gradient: staticEvent.gradient,
  };
}

// ── News (database-backed with fallback) ────────────────────────────────────

/**
 * Fetch all published news items from PostgreSQL, ordered by date descending.
 * Cached with tag "news" for on-demand invalidation.
 */
export async function getNewsItems() {
  "use cache";
  cacheLife("content");
  cacheTag("news");

  try {
    const newsList = await prisma.news.findMany({
      where: { status: "Published" },
      orderBy: { date: "desc" },
    });

    if (newsList && newsList.length > 0) {
      return newsList.map((item) => ({
        ...item,
        date: item.date instanceof Date ? item.date.toISOString() : String(item.date),
        formattedDate: formatDateString(item.date),
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
      }));
    }
  } catch (error) {
    console.warn(
      "[lib/data] Database unavailable for getNewsItems, using static fallback:",
      error instanceof Error ? error.message : error
    );
  }

  return news.map((item) => ({
    id: item.slug,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.excerpt,
    category: item.category,
    date: item.date,
    formattedDate: item.date,
    status: "Published",
    coverImage: null as string | null,
    author: "Santhigiri Ashram",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Fetch a single published news item by slug.
 */
export async function getNewsBySlug(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("news", `news:${slug}`);

  try {
    const item = await prisma.news.findUnique({
      where: { slug },
    });

    if (item && item.status === "Published") {
      return {
        ...item,
        date: item.date instanceof Date ? item.date.toISOString() : String(item.date),
        formattedDate: formatDateString(item.date),
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
      };
    }
  } catch (error) {
    console.warn(
      `[lib/data] Database unavailable for getNewsBySlug(${slug}), using static fallback:`,
      error instanceof Error ? error.message : error
    );
  }

  const staticItem = news.find((n) => n.slug === slug);
  if (!staticItem) return null;

  return {
    id: staticItem.slug,
    title: staticItem.title,
    slug: staticItem.slug,
    excerpt: staticItem.excerpt,
    content: staticItem.excerpt,
    category: staticItem.category,
    date: staticItem.date,
    formattedDate: staticItem.date,
    status: "Published",
    coverImage: null as string | null,
    author: "Santhigiri Ashram",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── Publications (database-backed with fallback) ────────────────────────────

/**
 * Returns published publications from PostgreSQL.
 */
export async function getPublications() {
  "use cache";
  cacheLife("content");
  cacheTag("publications");

  try {
    const list = await prisma.publication.findMany({
      where: { status: "Published" },
      orderBy: { displayOrder: "asc" },
    });

    if (list && list.length > 0) {
      return list.map((pub) => ({
        ...pub,
        price: Number(pub.price),
        createdAt: pub.createdAt instanceof Date ? pub.createdAt.toISOString() : String(pub.createdAt),
        updatedAt: pub.updatedAt instanceof Date ? pub.updatedAt.toISOString() : String(pub.updatedAt),
      }));
    }
  } catch (error) {
    console.warn(
      "[lib/data] Database unavailable for getPublications, using static fallback:",
      error instanceof Error ? error.message : error
    );
  }

  return publications.map((pub) => ({
    id: pub.slug,
    title: pub.title,
    slug: pub.slug,
    description: pub.description,
    longDescription: pub.longDescription,
    category: pub.category,
    price: pub.price,
    coverImage: null as string | null,
    author: pub.author,
    language: pub.language,
    pages: pub.pages,
    stock: 50,
    status: "Published",
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Returns a published publication by slug from PostgreSQL.
 */
export async function getPublicationBySlug(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag("publications", `publication:${slug}`);

  try {
    const pub = await prisma.publication.findUnique({
      where: { slug },
    });

    if (pub && pub.status === "Published") {
      return {
        ...pub,
        price: Number(pub.price),
        createdAt: pub.createdAt instanceof Date ? pub.createdAt.toISOString() : String(pub.createdAt),
        updatedAt: pub.updatedAt instanceof Date ? pub.updatedAt.toISOString() : String(pub.updatedAt),
      };
    }
  } catch (error) {
    console.warn(
      `[lib/data] Database unavailable for getPublicationBySlug(${slug}), using static fallback:`,
      error instanceof Error ? error.message : error
    );
  }

  const staticPub = publications.find((p) => p.slug === slug);
  if (!staticPub) return null;

  return {
    id: staticPub.slug,
    title: staticPub.title,
    slug: staticPub.slug,
    description: staticPub.description,
    longDescription: staticPub.longDescription,
    category: staticPub.category,
    price: staticPub.price,
    coverImage: null as string | null,
    author: staticPub.author,
    language: staticPub.language,
    pages: staticPub.pages,
    stock: 50,
    status: "Published",
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Returns gallery images.
 */
export async function getGalleryImages() {
  "use cache";
  cacheLife("content");
  cacheTag("gallery");

  return galleryImages;
}

/**
 * Aggregate homepage data: sections bundled with database content.
 */
export async function getHomepageData() {
  "use cache";
  cacheLife("homepage");
  cacheTag("homepage", "publications", "news");

  const [dbPublications, dbNews] = await Promise.all([
    getPublications(),
    getNewsItems(),
  ]);

  return {
    news: dbNews,
    publications: dbPublications,
    galleryImages,
    activities,
    testimonials,
    videos,
  };
}


