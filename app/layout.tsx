import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
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
  icons: {
    icon: "/lotus-emblem.jpg", // Must be placed inside the /public folder
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
      <body className="min-h-full flex flex-col">
        <Suspense>{children}</Suspense>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

