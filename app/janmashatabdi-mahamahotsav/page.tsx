"use client";

import { useScrollReveal } from "@/lib/animations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MahamahotsavHero from "@/components/mahamahotsav/MahamahotsavHero";
import AboutMahamahotsav from "@/components/mahamahotsav/AboutMahamahotsav";
import ProgrammeSection from "@/components/mahamahotsav/ProgrammeSection";
import AnnouncementsSection from "@/components/mahamahotsav/AnnouncementsSection";
import MahamahotsavGallery from "@/components/mahamahotsav/MahamahotsavGallery";
import ResourcesSection from "@/components/mahamahotsav/ResourcesSection";
import VenueContactSection from "@/components/mahamahotsav/VenueContactSection";

export default function JanmashatabdiMahamahotsavPage() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ivory">
        <MahamahotsavHero />
        <AboutMahamahotsav />
        <ProgrammeSection />
        <AnnouncementsSection />
        <MahamahotsavGallery />
        <ResourcesSection />
        <VenueContactSection />
      </main>
      <Footer />
    </>
  );
}
