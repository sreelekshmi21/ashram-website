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

import { videoStreamUrl, videoThumbnailUrl } from "@/lib/videoConfig";
import { imageDisplayUrl } from "@/lib/imageConfig";

// ── Image Gallery (database-backed with fallback) ───────────────────────────

export interface PublishedGalleryImage {
  id: string;
  title: string;
  description: string | null;
  category: string;
  url: string;
  gradient?: string;
  height?: string;
  displayOrder: number;
}

/**
 * Returns published gallery images.
 * Cached with tag "gallery" for on-demand invalidation.
 */
export async function getGalleryImages(category?: string): Promise<PublishedGalleryImage[]> {
  "use cache";
  cacheLife("content");
  cacheTag("gallery");

  const whereClause: { status: "Published"; isActive: true; category?: string } = {
    status: "Published",
    isActive: true,
  };
  if (category && category !== "All") {
    whereClause.category = category;
  }

  try {
    const dbImages = await prisma.imageGallery.findMany({
      where: whereClause,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    if (dbImages && dbImages.length > 0) {
      const heightPatterns = ["h-64", "h-72", "h-80", "h-64", "h-96", "h-72", "h-64", "h-80"];
      return dbImages.map((img, idx) => ({
        id: img.id,
        title: img.title,
        description: img.description,
        category: img.category,
        url: imageDisplayUrl(img.id),
        height: heightPatterns[idx % heightPatterns.length],
        displayOrder: img.displayOrder,
      }));
    }
  } catch (error) {
    console.warn(
      "[lib/data] Database unavailable for getGalleryImages, using static fallback:",
      error instanceof Error ? error.message : error
    );
  }

  return galleryImages.map((img) => ({
    id: String(img.id),
    title: img.title,
    description: null,
    category: "Ashram & Temple",
    url: "",
    gradient: img.gradient,
    height: img.height,
    displayOrder: img.id,
  }));
}

/**
 * Aggregate homepage data: sections bundled with database content.
 */
export async function getHomepageData() {
  "use cache";
  cacheLife("homepage");
  cacheTag("homepage", "publications", "news", "videos", "gallery");

  const [dbPublications, dbNews, dbVideos, dbImages] = await Promise.all([
    getPublications(),
    getNewsItems(),
    getPublishedVideos(),
    getGalleryImages(),
  ]);

  return {
    news: dbNews,
    publications: dbPublications,
    galleryImages: dbImages,
    activities,
    testimonials,
    videos: dbVideos,
  };
}

export interface PublishedVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  streamUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  formattedDuration: string;
  gradient?: string;
  displayOrder: number;
  createdAt: string;
}

/**
 * Fetch published videos, ordered by displayOrder asc, then createdAt desc.
 * Cached with tag "videos" for on-demand revalidation.
 */
export async function getPublishedVideos(category?: string): Promise<PublishedVideo[]> {
  "use cache";
  cacheLife("content");
  cacheTag("videos");

  const whereClause: { status: "Published"; category?: string } = {
    status: "Published",
  };
  if (category && category !== "All") {
    whereClause.category = category;
  }

  try {
    const dbVideos = await prisma.video.findMany({
      where: whereClause,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    if (dbVideos && dbVideos.length > 0) {
      return dbVideos.map((v) => {
        const sec = v.durationSeconds;
        let formattedDuration = "";
        if (sec != null && sec > 0) {
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          formattedDuration = `${m}:${String(s).padStart(2, "0")}`;
        }
        return {
          id: v.id,
          title: v.title,
          description: v.description || "",
          category: v.category,
          streamUrl: videoStreamUrl(v.id),
          thumbnailUrl: v.thumbnailKey ? videoThumbnailUrl(v.id) : null,
          durationSeconds: v.durationSeconds,
          formattedDuration,
          displayOrder: v.displayOrder,
          createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : String(v.createdAt),
        };
      });
    }
  } catch (error) {
    console.warn(
      "[lib/data] Database unavailable for getPublishedVideos, using static fallback:",
      error instanceof Error ? error.message : error
    );
  }

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: "Experience the profound teachings and heritage of Santhigiri Ashram.",
    category: "Spiritual Discourses",
    streamUrl: "",
    thumbnailUrl: null,
    durationSeconds: null,
    formattedDuration: v.duration,
    gradient: v.gradient,
    displayOrder: parseInt(v.id, 10) || 0,
    createdAt: new Date().toISOString(),
  }));
}


