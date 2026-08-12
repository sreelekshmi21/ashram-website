// ===== Janmashatabdi Mahamahotsav Data =====

export interface MahamahotsavStat {
  value: string;
  label: string;
  sublabel: string;
}

export interface ProgrammeEvent {
  id: string;
  title: string;
  category: "Spiritual" | "Cultural" | "Health" | "Youth" | "Global";
  date: string;
  time: string;
  venue: string;
  description: string;
  speaker?: string;
  gradient: string;
  featured?: boolean;
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: "Notice" | "Press" | "Guide" | "Update";
  linkText?: string;
  isImportant?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "Historical" | "Parnasala" | "Cultural" | "Rituals";
  gradient: string;
  icon: string;
  caption: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: "Book" | "Audio" | "Souvenir" | "Documentary";
  description: string;
  badge: string;
  gradient: string;
  icon: string;
}

// ── Statistics ──────────────────────────────────────────────────────────────
export const mahamahotsavStats: MahamahotsavStat[] = [
  {
    value: "100",
    label: "Years of Divine Legacy",
    sublabel: "Centenary of Navajyothi Sri Karunakara Guru",
  },
  {
    value: "365",
    label: "Days of Celebration",
    sublabel: "Year-long spiritual and cultural events",
  },
  {
    value: "1M+",
    label: "Expected Devotees",
    sublabel: "Pilgrims from across the globe",
  },
  {
    value: "100+",
    label: "Global Programs",
    sublabel: "Satsangs, summits, and service initiatives",
  },
];

// ── Programme Schedule / Events ─────────────────────────────────────────────
export const programmeEvents: ProgrammeEvent[] = [
  {
    id: "inaugural",
    title: "Grand Inaugural Ceremony of Janmashatabdi",
    category: "Global",
    date: "September 1, 2026",
    time: "09:00 AM IST",
    venue: "Main Lotus Auditorium, Santhigiri Ashram",
    description:
      "Solemn inauguration of the year-long birth centenary celebrations of Navajyothi Sri Karunakara Guru by international dignitaries and spiritual leaders.",
    speaker: "Ashram Board & Distinguished Guests",
    gradient: "from-saffron via-saffron-light to-gold",
    featured: true,
  },
  {
    id: "peace-conclave",
    title: "International Spiritual Harmony Conclave",
    category: "Spiritual",
    date: "September 15, 2026",
    time: "10:00 AM IST",
    venue: "Peace Pavilion, Pothencode",
    description:
      "Global interfaith dialogue focusing on universal brotherhood, inner peace, and the timeless spiritual vision of the Guru.",
    speaker: "Renowned Scholars & Inter-religious Delegates",
    gradient: "from-forest via-forest-light to-gold-dark",
    featured: true,
  },
  {
    id: "ayurveda-summit",
    title: "Global Ayurveda & Holistic Health Expo",
    category: "Health",
    date: "October 10-12, 2026",
    time: "09:30 AM - 05:30 PM",
    venue: "Santhigiri Healthcare Complex",
    description:
      "Three-day international summit bringing together traditional healers, scientists, and Ayurvedic practitioners to showcase holistic wellness.",
    speaker: "Dr. Sreekumar & International Physicians",
    gradient: "from-gold-dark via-gold to-saffron-light",
  },
  {
    id: "shatabdi-pushpanjali",
    title: "Shatabdi Mahapushpanjali & Prarthana",
    category: "Spiritual",
    date: "November 5, 2026",
    time: "05:00 AM - 08:00 PM",
    venue: "Sacred Lotus Parnasala",
    description:
      "Continuous mass flower offering and devotional chanting honoring the Guru, invoking peace, health, and spiritual enlightenment for all.",
    speaker: "Ashram Monastics & Devotees",
    gradient: "from-saffron to-forest-dark",
    featured: true,
  },
  {
    id: "youth-retreat",
    title: "Youth Leadership & Meditation Retreat",
    category: "Youth",
    date: "December 18-20, 2026",
    time: "06:00 AM IST",
    venue: "Youth Awakening Camp, Ashram Grounds",
    description:
      "Immersive residential retreat empowering the next generation through mindfulness, moral leadership, yoga, and selfless service.",
    speaker: "Swami Prakashananda & Guest Mentors",
    gradient: "from-forest-light via-forest to-gold",
  },
  {
    id: "cultural-melange",
    title: "Symphony of Devotion: Centenary Cultural Festival",
    category: "Cultural",
    date: "January 14, 2027",
    time: "06:00 PM IST",
    venue: "Open Air Amphitheatre",
    description:
      "A grand evening of classical music, devotional chants, traditional dance performances, and theatrical sagas depicting the Guru's life.",
    speaker: "Acclaimed Artists & Ashram Choir",
    gradient: "from-gold via-saffron-light to-forest-dark",
  },
];

// ── Announcements ───────────────────────────────────────────────────────────
export const mahamahotsavAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    date: "August 8, 2026",
    title: "Online Pilgrim Registration Portal Now Live",
    summary:
      "Devotees intending to visit Santhigiri Ashram during the Janmashatabdi Mahamahotsav celebrations are requested to register online for priority accommodation and prasadam pass.",
    category: "Notice",
    isImportant: true,
    linkText: "Register as Pilgrim",
  },
  {
    id: "ann-2",
    date: "August 2, 2026",
    title: "Volunteering Call for Centenary Celebrations",
    summary:
      "Join hands in divine service! Applications are open for volunteers in medical support, hospitality, crowd management, and media coverage.",
    category: "Update",
    linkText: "Join Volunteer Brigade",
  },
  {
    id: "ann-3",
    date: "July 25, 2026",
    title: "Special Transport & Shuttle Services Arranged",
    summary:
      "KSRTC and private shuttle services will operate continuously from Trivandrum Central Railway Station and International Airport directly to Pothencode Ashram campus.",
    category: "Guide",
  },
  {
    id: "ann-4",
    date: "July 12, 2026",
    title: "Commemorative Souvenir & Book Release Announced",
    summary:
      "A special 500-page collector's volume detailing the spiritual lineage of Navajyothi Sri Karunakara Guru will be released during the Inaugural Ceremony.",
    category: "Press",
  },
];

// ── Gallery Items ───────────────────────────────────────────────────────────
export const galleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Sacred Lotus Parnasala",
    category: "Parnasala",
    gradient: "linear-gradient(135deg, #1A3A25, #2D5A3D, #C9A84C)",
    icon: "🛕",
    caption: "The majestic 91-foot lotus structure illuminated during evening prayers.",
  },
  {
    id: "gal-2",
    title: "Navajyothi Sri Karunakara Guru",
    category: "Historical",
    gradient: "linear-gradient(135deg, #E8751A, #F5A623, #C9A84C)",
    icon: "🙏",
    caption: "The divine founder whose life and teachings inspire millions globally.",
  },
  {
    id: "gal-3",
    title: "Shatabdi Prarthana & Satsang",
    category: "Rituals",
    gradient: "linear-gradient(135deg, #2D5A3D, #3D7A53, #1A3A25)",
    icon: "🔥",
    caption: "Devotees participating in morning prayers during the centenary retreat.",
  },
  {
    id: "gal-4",
    title: "Cultural Performances",
    category: "Cultural",
    gradient: "linear-gradient(135deg, #C9A84C, #E8751A, #1A3A25)",
    icon: "🎭",
    caption: "Traditional music and dance ensembles performing devotional tributes.",
  },
  {
    id: "gal-5",
    title: "Annadanam & Free Community Kitchen",
    category: "Rituals",
    gradient: "linear-gradient(135deg, #F5A623, #E8751A, #2D5A3D)",
    icon: "🍲",
    caption: "Sacred prasadam distributed freely to thousands of pilgrims daily.",
  },
  {
    id: "gal-6",
    title: "Global Youth Meditation Camp",
    category: "Parnasala",
    gradient: "linear-gradient(135deg, #1A3A25, #C9A84C, #E8751A)",
    icon: "🧘",
    caption: "Young seekers learning mindfulness and inner contemplation on the ashram lawns.",
  },
];

// ── Related Resources ───────────────────────────────────────────────────────
export const resourceItems: ResourceItem[] = [
  {
    id: "res-1",
    title: "Janmashatabdi Commemorative Volume",
    type: "Book",
    description:
      "A comprehensive retrospective featuring archival photographs, essays, and divine messages honoring the Guru.",
    badge: "Official Collector's Edition",
    gradient: "linear-gradient(135deg, #1A3A25, #2D5A3D)",
    icon: "📚",
  },
  {
    id: "res-2",
    title: "Centenary Anthem & Devotional Hymns",
    type: "Audio",
    description:
      "Specially composed sacred chants and songs celebrating 100 years of spiritual illumination.",
    badge: "Free Digital Download",
    gradient: "linear-gradient(135deg, #E8751A, #F5A623)",
    icon: "🎵",
  },
  {
    id: "res-3",
    title: "The Path of Navajyothi — Documentary Film",
    type: "Documentary",
    description:
      "An inspiring feature documentary tracing the extraordinary life and universal mission of the Guru.",
    badge: "HD Streaming",
    gradient: "linear-gradient(135deg, #C9A84C, #1A3A25)",
    icon: "🎬",
  },
  {
    id: "res-4",
    title: "Centenary Brass Medallion & Souvenir Kit",
    type: "Souvenir",
    description:
      "Sacred memorabilia set including a gold-plated centenary emblem, brass lamp, and blessed lotus coin.",
    badge: "Ashram Store",
    gradient: "linear-gradient(135deg, #3D7A53, #C9A84C)",
    icon: "🏅",
  },
];

// ── Venue & Helpdesk ────────────────────────────────────────────────────────
export const venueDetails = {
  locationName: "Santhigiri Ashram, Pothencode",
  city: "Thiruvananthapuram, Kerala 695584, India",
  helplinePhone: "+91 471 241 8100",
  email: "mahamahotsav@santhigiriashram.org",
  nearestRailway: "Thiruvananthapuram Central (TVC) — 18 km",
  nearestAirport: "Trivandrum International Airport (TRV) — 20 km",
  nearestBusStand: "Pothencode KSRTC Bus Station — 1.5 km",
};
