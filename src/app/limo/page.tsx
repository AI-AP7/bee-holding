"use client";

import FleetShowcase from "@/components/limo/FleetShowcase";
import ReviewsSection from "@/components/limo/ReviewsSection";
import SeoScripts from "@/components/limo/SeoScripts";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const BookingModal = dynamic(() => import("@/components/limo/BookingModal"));


export default function LimoPage() {
  const [activeSection, setActiveSection] = useState("experience");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const sections = [
    { id: "experience", label: "Experience" },
    { id: "fleet", label: "Fleet" },
    { id: "reviews", label: "Reviews" },
  ];

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowBookingModal(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <SeoScripts />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[65vh] flex flex-col">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/s-class.webp')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          </div>

          {/* Tactical Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(rgba(189, 219, 55, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(189, 219, 55, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />

          {/* Top Navigation / Brand Bar */}
          <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-8 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                BLACK EXCELLENCE ENTERPRISES
              </span>
            </Link>

            {/* Tier Tag */}
            <div className="inline-flex items-center gap-3 px-3 py-1 border border-lime/50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                Premier Tier Service
              </span>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center pb-20 pt-4">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
              {/* Main Content */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative w-40 h-40 mb-0">
                  <Image
                    src="/ufirst-logo.png"
                    alt="UFirst Limos Logo"
                    fill
                    className="object-contain"
                    sizes="160px"
                  />
                </div>

                <p className="text-lg text-on-surface-variant max-w-lg text-justify mb-6">
                  Courtesy Epitomized, Opulence Personified. Whether its our safety certified, luxury fleet, or our top rated chauffeurs, rest assured the with us, you come first.
                </p>

                <a href="#fleet" className="btn-lime px-12 py-4 text-xl">
                  Reserve Now
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
            <nav className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-outline/20">
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
              <div className="flex items-center justify-center gap-1 h-14">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                      activeSection === section.id
                        ? "bg-lime text-black font-bold"
                        : "text-white hover:text-lime"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-24 px-6 md:px-12 lg:px-24 bg-surface-low">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lime text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-mono)" }}>
                  The Experience
                </p>
                <h2 className="text-display text-4xl md:text-5xl text-primary mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  TRAVEL WITH GRACE,<br />
                  <span className="text-lime">ARRIVE IN STYLE</span>
                </h2>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  Make all your big moments feel as special as they are. From prom to weddings, from corporate travel to airport transit, we put you first.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Service Areas", value: "4 States" },
                    { label: "Fleet Vehicles", value: "5+" },
                    { label: "On-Time Rate", value: "99%" },
                    { label: "Customer Rating", value: "5.0" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-surface-mid rounded-lg">
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src="/cad_v.jpeg"
                    alt="Luxury limousine interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-lime/50 rounded-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Fleet Section */}
        <FleetShowcase onVehicleSelect={(vehicleId) => {
          setSelectedVehicleId(vehicleId);
          setShowBookingModal(true);
        }} />

        {/* Booking Modal */}
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          selectedVehicleId={selectedVehicleId}
        />

        {/* Reviews Section */}
        <ReviewsSection />

        {/* Footer */}
        <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-outline/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime rounded-md flex items-center justify-center">
                  <span className="text-black font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                    B
                  </span>
                </div>
                <div>
                  <p className="text-primary font-semibold">UFirst Limos</p>
                  <p className="text-xs text-on-surface-variant">A subsidiary of Black Excellence Enterprises</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-on-surface-variant">
                <a href="tel:+14105550123" className="hover:text-primary transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
                  +1 (443) 680-0071
                </a>
                <a href="mailto:ufirstlimo@gmail.com" className="hover:text-primary transition-colors">
                  ufirstlimo@gmail.com
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-outline/20 text-center text-sm text-on-surface-variant">
              <p>© 2024 Black Excellence Enterprises. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
