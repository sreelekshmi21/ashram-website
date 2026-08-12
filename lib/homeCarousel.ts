// ===== Home Hero Carousel Slide Data =====

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: "/images/home/lotus1.png",
    title: "Welcome to Santhigiri Ashram",
    subtitle:
      "A sacred abode of spiritual wisdom, holistic healing, and selfless service — guiding seekers toward inner peace and universal harmony since 1964.",
    buttonText: "Explore",
    buttonLink: "#about",
  },
  {
    id: 2,
    image: "/images/home/hero-evening.png",
    title: "The Lotus of Divine Grace",
    subtitle:
      "Our iconic lotus-shaped sanctum stands as a beacon of spiritual enlightenment, illuminating the path for devotees from across the world.",
    buttonText: "Know More",
    buttonLink: "#about",
  },
  {
    id: 3,
    image: "/images/home/hero-aerial.png",
    title: "A Sanctuary of Serenity",
    subtitle:
      "Nestled amidst lush gardens, sacred groves, and flowing waters — a divine campus where nature and spirituality become one.",
    buttonText: "Visit Us",
    buttonLink: "#contact",
  },
  {
    id: 4,
    image: "/images/home/image-4.png",
    title: "A Gathering of Devotion",
    subtitle:
      "Experience the divine energy of thousands of devotees united in prayer, meditation, and celebration of the Guru's teachings.",
    buttonText: "View Events",
    buttonLink: "#events",
  },
  {
    id: 5,
    image: "/images/home/lotusImage.jpeg",
    title: "The Path of Inner Peace",
    subtitle:
      "Join our meditation sessions, yoga retreats, and spiritual programs designed to awaken the soul and nurture the spirit.",
    buttonText: "Our Activities",
    buttonLink: "#activities",
  },
];
