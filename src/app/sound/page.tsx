"use client";

import { useState } from "react";
import KJNavigation from "@/components/sound/KJNavigation";
import KJHero from "@/components/sound/KJHero";
import KJAbout from "@/components/sound/KJAbout";
import KJEvents from "@/components/sound/KJEvents";
import KJInstallations from "@/components/sound/KJInstallations";
import KJPortfolio from "@/components/sound/KJPortfolio";
import KJFooter from "@/components/sound/KJFooter";
import EventInquiryModal from "@/components/modals/EventInquiryModal";
import InstallationInquiryModal from "@/components/modals/InstallationInquiryModal";

export default function KJSoundLanding() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  return (
    <main className="kj-theme min-h-screen" style={{ background: "#0b1326" }}>
      {/* Navigation */}
      <KJNavigation 
        onEventClick={() => setIsEventModalOpen(true)}
        onInstallClick={() => setIsInstallModalOpen(true)}
      />

      {/* Hero */}
      <KJHero 
        onEventClick={() => setIsEventModalOpen(true)}
        onInstallClick={() => setIsInstallModalOpen(true)}
      />

      {/* About */}
      <KJAbout />

      {/* Events */}
      <KJEvents onEventClick={() => setIsEventModalOpen(true)} />

      {/* Installations */}
      <KJInstallations onInstallClick={() => setIsInstallModalOpen(true)} />

      {/* Portfolio */}
      <KJPortfolio />

      {/* Footer */}
      <KJFooter />

      {/* Modals */}
      <EventInquiryModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)} 
      />
      <InstallationInquiryModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />
    </main>
  );
}
