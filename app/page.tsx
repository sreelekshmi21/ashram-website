"use client";

import { useScrollReveal } from "@/lib/animations";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import MahamahotsavBanner from "@/components/MahamahotsavBanner";
import About from "@/components/About";
import Founder from "@/components/Founder";
import Activities from "@/components/Activities";
import Events from "@/components/Events";
import News from "@/components/News";
import Gallery from "@/components/Gallery";
import VideoGallery from "@/components/VideoGallery";
import Publications from "@/components/Publications";
import Testimonials from "@/components/Testimonials";
import DonationCTA from "@/components/DonationCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main>
        <HeroCarousel />
        <MahamahotsavBanner />
        <About />
        <Founder />
        <Activities />
        <Events />
        <News />
        <Gallery />
        <VideoGallery />
        <Publications />
        <Testimonials />
        <DonationCTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
