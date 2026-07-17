import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Santhigiri Ashram — A Sacred Abode of Spiritual Wisdom",
  description:
    "Santhigiri Ashram is a renowned spiritual institution in Thiruvananthapuram, Kerala, India — dedicated to spiritual awakening, Ayurvedic healing, yoga, meditation, education, and selfless service to humanity.",
  keywords: [
    "Santhigiri Ashram",
    "spiritual ashram",
    "meditation",
    "Ayurveda",
    "yoga",
    "Kerala",
    "Thiruvananthapuram",
    "Navajyothi Sri Karunakara Guru",
    "spiritual healing",
    "Indian ashram",
  ],
  authors: [{ name: "Santhigiri Ashram" }],
  openGraph: {
    title: "Santhigiri Ashram — A Sacred Abode of Spiritual Wisdom",
    description:
      "A renowned spiritual institution dedicated to spiritual awakening, Ayurvedic healing, and selfless service to humanity.",
    type: "website",
    locale: "en_US",
    siteName: "Santhigiri Ashram",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
