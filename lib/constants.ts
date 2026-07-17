// ===== Navigation =====
export const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Founder", href: "#founder" },
  { label: "Activities", href: "#activities" },
  { label: "Events", href: "#events" },
  { label: "Pushpanjali", href: "/pushpanjali" },
  { label: "Publications", href: "#publications" },
  { label: "Gallery", href: "#gallery" },
  { label: "Donate", href: "/donate" },
  { label: "Contact", href: "#contact" },
];

export const languages = [
  { code: "en", label: "English" },
  { code: "ml", label: "മലയാളം" },
  { code: "hi", label: "हिन्दी" },
];

// ===== Activities =====
export const activities = [
  {
    icon: "🙏",
    title: "Spiritual Discourses",
    description:
      "Enlightening talks and satsangs that guide seekers on the path of spiritual awakening and divine wisdom.",
  },
  {
    icon: "🧘",
    title: "Meditation",
    description:
      "Guided meditation sessions fostering inner peace, mindfulness, and a deeper connection with the self.",
  },
  {
    icon: "🌿",
    title: "Ayurveda",
    description:
      "Traditional Ayurvedic healing practices and treatments rooted in ancient Indian medical wisdom.",
  },
  {
    icon: "🕉️",
    title: "Yoga",
    description:
      "Holistic yoga programs combining physical postures, breathing exercises, and spiritual practices.",
  },
  {
    icon: "💛",
    title: "Charity",
    description:
      "Community outreach and charitable initiatives serving the underprivileged and promoting social welfare.",
  },
  {
    icon: "📚",
    title: "Education",
    description:
      "Educational programs nurturing moral values, spiritual knowledge, and holistic development of youth.",
  },
];

// ===== Events =====
export const events = [
  {
    date: "2026-08-15",
    day: "15",
    month: "Aug",
    title: "Guru Poornima Celebration",
    slug: "guru-poornima-celebration",
    fee: 0,
    description:
      "A sacred celebration honoring the divine Guru tradition with special prayers, discourses, and cultural programs.",
    gradient: "from-saffron to-saffron-light",
  },
  {
    date: "2026-09-05",
    day: "05",
    month: "Sep",
    title: "Annual Meditation Retreat",
    slug: "annual-meditation-retreat",
    fee: 2500,
    description:
      "A week-long immersive retreat for deep meditation, spiritual healing, and self-discovery in serene surroundings.",
    gradient: "from-forest to-forest-light",
  },
  {
    date: "2026-10-02",
    day: "02",
    month: "Oct",
    title: "Ayurveda Health Camp",
    slug: "ayurveda-health-camp",
    fee: 500,
    description:
      "Free Ayurvedic consultations, traditional therapies, and wellness workshops for community health and harmony.",
    gradient: "from-gold-dark to-gold",
  },
];

// ===== News =====
export const news = [
  {
    date: "July 10, 2026",
    title: "New Meditation Center Inaugurated",
    excerpt:
      "The Ashram inaugurated a state-of-the-art meditation center designed to accommodate over 500 practitioners in serene, climate-controlled halls.",
    category: "Infrastructure",
  },
  {
    date: "July 5, 2026",
    title: "International Yoga Day Celebrations",
    excerpt:
      "Thousands of devotees participated in the International Yoga Day celebrations featuring mass yoga sessions, workshops, and spiritual discourses.",
    category: "Events",
  },
  {
    date: "June 28, 2026",
    title: "Ayurveda Research Center Partnership",
    excerpt:
      "Santhigiri Ashram signed a landmark MoU with leading research institutions for advancing Ayurvedic medicine and holistic healing practices.",
    category: "Research",
  },
];

// ===== Gallery Images (CSS gradient placeholders) =====
export const galleryImages = [
  { id: 1, title: "Temple at Sunrise", gradient: "linear-gradient(135deg, #F5A623, #E8751A, #C55D0E)", height: "h-64" },
  { id: 2, title: "Meditation Hall", gradient: "linear-gradient(135deg, #2D5A3D, #3D7A53, #C9A84C)", height: "h-80" },
  { id: 3, title: "Sacred Garden", gradient: "linear-gradient(135deg, #3D7A53, #C9A84C, #F0E6C8)", height: "h-72" },
  { id: 4, title: "Evening Prayers", gradient: "linear-gradient(135deg, #E8751A, #1A3A25, #2D5A3D)", height: "h-64" },
  { id: 5, title: "Ashram Grounds", gradient: "linear-gradient(135deg, #C9A84C, #F5A623, #FFF8F0)", height: "h-80" },
  { id: 6, title: "Community Kitchen", gradient: "linear-gradient(135deg, #1A3A25, #E8751A, #F5A623)", height: "h-72" },
  { id: 7, title: "Yoga Session", gradient: "linear-gradient(135deg, #2D5A3D, #F0E6C8, #C9A84C)", height: "h-64" },
  { id: 8, title: "Festival Celebrations", gradient: "linear-gradient(135deg, #F5A623, #C9A84C, #2D5A3D)", height: "h-72" },
];

// ===== Videos =====
export const videos = [
  {
    id: "1",
    title: "The Spiritual Legacy of Santhigiri Ashram",
    duration: "12:45",
    gradient: "linear-gradient(135deg, #1A3A25, #2D5A3D)",
  },
  {
    id: "2",
    title: "Guided Meditation with the Masters",
    duration: "28:30",
    gradient: "linear-gradient(135deg, #E8751A, #F5A623)",
  },
  {
    id: "3",
    title: "Ayurveda: Ancient Healing for Modern Times",
    duration: "18:15",
    gradient: "linear-gradient(135deg, #C9A84C, #F0E6C8)",
  },
];

// ===== Publications =====
export const publications = [
  {
    title: "The Path of the Guru",
    author: "Ashram Publications",
    description: "A comprehensive guide to the Guru-disciple tradition and its relevance in modern spiritual life.",
    gradient: "linear-gradient(135deg, #1A3A25, #2D5A3D, #3D7A53)",
  },
  {
    title: "Ayurveda: Wisdom of Life",
    author: "Dr. Sreekumar",
    description: "An exploration of Ayurvedic principles, remedies, and lifestyle practices for holistic well-being.",
    gradient: "linear-gradient(135deg, #C9A84C, #F5A623, #E8751A)",
  },
  {
    title: "Meditation & Inner Peace",
    author: "Swami Prakashananda",
    description: "Practical teachings on meditation techniques drawn from the ancient spiritual traditions of India.",
    gradient: "linear-gradient(135deg, #E8751A, #C55D0E, #1A3A25)",
  },
  {
    title: "Sacred Hymns & Prayers",
    author: "Ashram Publications",
    description: "A collection of sacred hymns, chants, and devotional prayers for daily spiritual practice.",
    gradient: "linear-gradient(135deg, #3D7A53, #C9A84C, #F0E6C8)",
  },
];

// ===== Testimonials =====
export const testimonials = [
  {
    name: "Dr. Anitha Krishnan",
    role: "Devotee & Physician",
    quote:
      "Santhigiri Ashram has been a beacon of spiritual light in my life. The teachings have transformed my understanding of purpose and inner peace.",
    avatar: "AK",
  },
  {
    name: "Rajesh Menon",
    role: "Volunteer & Educator",
    quote:
      "The Ashram's commitment to education and community service is truly inspiring. It is a place where ancient wisdom meets compassionate action.",
    avatar: "RM",
  },
  {
    name: "Priya Nair",
    role: "Yoga Practitioner",
    quote:
      "My journey at Santhigiri has been nothing short of transformative. The meditation and yoga programs have brought profound clarity and peace to my life.",
    avatar: "PN",
  },
  {
    name: "Dr. Suresh Kumar",
    role: "Ayurveda Researcher",
    quote:
      "The Ashram's Ayurvedic treatments are deeply rooted in authentic tradition while embracing modern research standards. A truly remarkable institution.",
    avatar: "SK",
  },
];

// ===== Contact Info =====
export const contactInfo = {
  address: "Santhigiri Ashram, Pothencode, Thiruvananthapuram, Kerala 695584, India",
  phone: "+91 471 241 8100",
  email: "info@santhigiriashram.org",
  mapUrl: "https://maps.google.com/?q=Santhigiri+Ashram+Pothencode",
};

// ===== Social Links =====
export const socialLinks = [
  { platform: "Facebook", href: "#", icon: "fb" },
  { platform: "Instagram", href: "#", icon: "ig" },
  { platform: "YouTube", href: "#", icon: "yt" },
  { platform: "Twitter", href: "#", icon: "tw" },
];
