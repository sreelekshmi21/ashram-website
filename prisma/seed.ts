import { PrismaClient, EventStatus, EventCategory, PublicationStatus, NewsStatus, AdminRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding events...");

  const events = [
    {
      title: "Guru Poornima Celebration",
      slug: "guru-poornima-celebration",
      description:
        "A sacred celebration honoring the divine Guru tradition with special prayers, discourses, and cultural programs.",
      venue: "Santhigiri Ashram, Pothencode",
      startDate: new Date("2026-08-15T09:00:00.000Z"),
      endDate: new Date("2026-08-15T18:00:00.000Z"),
      registrationRequired: true,
      registrationFee: 0,
      registrationDeadline: new Date("2026-08-14T23:59:59.000Z"),
      status: EventStatus.Published,
      category: EventCategory.YEARLY,
      gradient: "from-saffron to-saffron-light",
    },
    {
      title: "Annual Meditation Retreat",
      slug: "annual-meditation-retreat",
      description:
        "A week-long immersive retreat for deep meditation, spiritual healing, and self-discovery in serene surroundings.",
      venue: "Santhigiri Ashram, Pothencode",
      startDate: new Date("2026-09-05T06:00:00.000Z"),
      endDate: new Date("2026-09-12T18:00:00.000Z"),
      registrationRequired: true,
      registrationFee: 2500,
      registrationDeadline: new Date("2026-09-03T23:59:59.000Z"),
      status: EventStatus.Published,
      category: EventCategory.YEARLY,
      gradient: "from-forest to-forest-light",
    },
    {
      title: "Ayurveda Health Camp",
      slug: "ayurveda-health-camp",
      description:
        "Free Ayurvedic consultations, traditional therapies, and wellness workshops for community health and harmony.",
      venue: "Santhigiri Ashram, Pothencode",
      startDate: new Date("2026-10-02T08:00:00.000Z"),
      endDate: new Date("2026-10-02T17:00:00.000Z"),
      registrationRequired: true,
      registrationFee: 500,
      registrationDeadline: new Date("2026-09-30T23:59:59.000Z"),
      status: EventStatus.Published,
      category: EventCategory.MONTHLY,
      gradient: "from-gold-dark to-gold",
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
    console.log(`  ✅ ${event.title}`);
  }

  // ── Publications ─────────────────────────────────────────────────────────
  console.log("\n📚 Seeding publications...");

  const publications = [
    {
      title: "The Path of the Guru",
      slug: "the-path-of-the-guru",
      author: "Ashram Publications",
      price: 350,
      pages: 248,
      language: "English",
      isbn: "978-81-XXXXX-01-0",
      description:
        "A comprehensive guide to the Guru-disciple tradition and its relevance in modern spiritual life.",
      longDescription:
        "This seminal work explores the sacred bond between Guru and disciple — a tradition that forms the very foundation of Indian spiritual life. Drawing from the teachings of Navajyothi Sri Karunakara Guru, this book illuminates the path of surrender, devotion, and self-transformation. It covers the historical significance of the Guru tradition across various spiritual lineages, practical guidance for seekers on the path, and profound insights into the nature of divine grace and spiritual evolution.",
      gradient: "linear-gradient(135deg, #1A3A25, #2D5A3D, #3D7A53)",
      status: PublicationStatus.Published,
      displayOrder: 1,
    },
    {
      title: "Ayurveda: Wisdom of Life",
      slug: "ayurveda-wisdom-of-life",
      author: "Dr. Sreekumar",
      price: 450,
      pages: 312,
      language: "English",
      isbn: "978-81-XXXXX-02-7",
      description:
        "An exploration of Ayurvedic principles, remedies, and lifestyle practices for holistic well-being.",
      longDescription:
        "Rooted in thousands of years of Indian medical wisdom, this book presents Ayurveda not merely as a system of healing, but as a complete science of life. Dr. Sreekumar bridges ancient knowledge with modern understanding, covering the three doshas, dietary principles, seasonal routines, herbal remedies, and therapeutic practices. Richly illustrated with practical recipes and wellness protocols, it serves as both an introductory guide and a daily reference for anyone seeking harmony of body, mind, and spirit.",
      gradient: "linear-gradient(135deg, #C9A84C, #F5A623, #E8751A)",
      status: PublicationStatus.Published,
      displayOrder: 2,
    },
    {
      title: "Meditation & Inner Peace",
      slug: "meditation-and-inner-peace",
      author: "Swami Prakashananda",
      price: 275,
      pages: 196,
      language: "English",
      isbn: "978-81-XXXXX-03-4",
      description:
        "Practical teachings on meditation techniques drawn from the ancient spiritual traditions of India.",
      longDescription:
        "Swami Prakashananda distills decades of meditative practice into clear, accessible teachings suitable for both beginners and advanced practitioners. The book explores multiple meditation traditions — from breath awareness and mantra repetition to contemplative prayer and mindfulness — offering step-by-step instructions for each. Interwoven with stories from the Ashram's spiritual heritage, it demonstrates how regular meditation practice can dissolve stress, awaken inner clarity, and reveal the deeper dimensions of consciousness.",
      gradient: "linear-gradient(135deg, #E8751A, #C55D0E, #1A3A25)",
      status: PublicationStatus.Published,
      displayOrder: 3,
    },
    {
      title: "Sacred Hymns & Prayers",
      slug: "sacred-hymns-and-prayers",
      author: "Ashram Publications",
      price: 200,
      pages: 164,
      language: "English / Sanskrit",
      isbn: "978-81-XXXXX-04-1",
      description:
        "A collection of sacred hymns, chants, and devotional prayers for daily spiritual practice.",
      longDescription:
        "This beautifully curated anthology brings together devotional hymns, Vedic chants, and prayers that form the daily spiritual practice at Santhigiri Ashram. Each hymn is presented with its original Sanskrit text, transliteration, and English translation, along with notes on its spiritual significance and the recommended manner of recitation. Whether used for personal worship, group chanting, or contemplative study, this collection is an invaluable companion for deepening one's connection with the Divine.",
      gradient: "linear-gradient(135deg, #3D7A53, #C9A84C, #F0E6C8)",
      status: PublicationStatus.Published,
      displayOrder: 4,
    },
  ];

  for (const pub of publications) {
    await prisma.publication.upsert({
      where: { slug: pub.slug },
      update: pub,
      create: pub,
    });
    console.log(`  ✅ ${pub.title}`);
  }

  // ── News ──────────────────────────────────────────────────────────────────
  console.log("\n📰 Seeding news...");

  const newsItems = [
    {
      title: "New Meditation Center Inaugurated",
      slug: "new-meditation-center-inaugurated",
      excerpt:
        "The Ashram inaugurated a state-of-the-art meditation center designed to accommodate over 500 practitioners in serene, climate-controlled halls.",
      content:
        "The Ashram inaugurated a state-of-the-art meditation center designed to accommodate over 500 practitioners in serene, climate-controlled halls. The ceremony was attended by spiritual leaders, dignitaries, and hundreds of devotees from around the world. The new facility offers specialized acoustic design, natural lighting, and peaceful gardens to foster deep contemplation and spiritual practice.",
      category: "Infrastructure",
      date: new Date("2026-07-10T10:00:00.000Z"),
      status: NewsStatus.Published,
    },
    {
      title: "International Yoga Day Celebrations",
      slug: "international-yoga-day-celebrations",
      excerpt:
        "Thousands of devotees participated in the International Yoga Day celebrations featuring mass yoga sessions, workshops, and spiritual discourses.",
      content:
        "Thousands of devotees participated in the International Yoga Day celebrations featuring mass yoga sessions, workshops, and spiritual discourses. Experienced yoga masters guided participants through traditional asanas, pranayama, and meditation techniques aimed at promoting physical wellness and mental clarity.",
      category: "Events",
      date: new Date("2026-07-05T08:30:00.000Z"),
      status: NewsStatus.Published,
    },
    {
      title: "Ayurveda Research Center Partnership",
      slug: "ayurveda-research-center-partnership",
      excerpt:
        "Santhigiri Ashram signed a landmark MoU with leading research institutions for advancing Ayurvedic medicine and holistic healing practices.",
      content:
        "Santhigiri Ashram signed a landmark MoU with leading research institutions for advancing Ayurvedic medicine and holistic healing practices. This collaborative initiative will focus on clinical research, herbal formulation standardization, and evidence-based Ayurvedic treatment protocols.",
      category: "Research",
      date: new Date("2026-06-28T14:00:00.000Z"),
      status: NewsStatus.Published,
    },
  ];

  for (const item of newsItems) {
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
    console.log(`  ✅ ${item.title}`);
  }

  // ── Admin Users ─────────────────────────────────────────────────────────
  console.log("\n🔐 Seeding admin users...");

  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@123456";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@santhigiriashram.org" },
    update: { passwordHash },
    create: {
      email: "admin@santhigiriashram.org",
      passwordHash,
      name: "Super Admin",
      role: AdminRole.SuperAdmin,
      isActive: true,
    },
  });
  console.log("  ✅ Super Admin (admin@santhigiriashram.org)");

  console.log("\n🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
