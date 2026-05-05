"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import type { FleetVehicle } from "@/lib/limo";
import FleetShowcase from "@/components/limo/FleetShowcase";
import ReviewsSection from "@/components/limo/ReviewsSection";
import SeoScripts from "@/components/limo/SeoScripts";

const BookingModal = dynamic(() => import("@/components/limo/BookingModal"));

const sections = [
  { id: "experience", label: "Experience" },
  { id: "fleet", label: "Fleet" },
  { id: "reviews", label: "Reviews" },
];

interface LimoPageClientProps {
  vehicles: FleetVehicle[];
}

export default function LimoPageClient({ vehicles }: LimoPageClientProps) {
  const [activeSection, setActiveSection] = useState("experience");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) {
          continue;
        }

        const { offsetTop, offsetHeight } = element;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <SeoScripts />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-lime focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to main content
      </a>
      <main id="main-content" className="min-h-screen bg-background">
        <section className="relative flex min-h-[65vh] flex-col">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/s-class.webp')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          </div>

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(189, 219, 55, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(189, 219, 55, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 pt-8 md:flex-row md:px-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                BLACK EXCELLENCE ENTERPRISES
              </span>
            </Link>

            <div className="inline-flex items-center gap-3 rounded-full border border-lime/50 px-3 py-1">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-lime animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                Premier Tier Service
              </span>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center pb-20 pt-4">
            <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-0 h-40 w-40">
                  <Image
                    src="/ufirst-logo.png"
                    alt="UFirst Limos logo"
                    fill
                    className="object-contain"
                    sizes="160px"
                    priority
                  />
                </div>

                <p className="max-w-lg text-balance text-lg text-on-surface-variant mb-6">
                  Courtesy epitomized, opulence personified. Whether it is our safety-certified luxury fleet or our top-rated chauffeurs, you come first.
                </p>

                <a
                  href="#fleet"
                  className="btn-lime px-12 py-4 text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                >
                  Reserve Now
                </a>
              </div>
            </div>
          </div>

          <nav className="absolute bottom-0 left-0 right-0 border-t border-outline/20 bg-black/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
              <div className="flex h-14 items-center justify-center gap-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
                      activeSection === section.id
                        ? "bg-lime font-bold text-black"
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

        <section id="experience" className="scroll-mt-24 bg-surface-low px-6 py-24 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="mb-4 text-xs uppercase tracking-widest text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                  The Experience
                </p>
                <h1 className="text-display mb-6 text-4xl text-primary md:text-5xl text-balance">
                  Travel With Grace,
                  <br />
                  <span className="text-lime">Arrive In Style</span>
                </h1>
                <p className="mb-8 leading-relaxed text-on-surface-variant">
                  Make every major moment feel as special as it should. From prom to weddings, from corporate travel to airport transit, the service is built around you.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Service Areas", value: "4 States" },
                    { label: "Fleet Vehicles", value: `${vehicles.length}+` },
                    { label: "On-Time Rate", value: "99%" },
                    { label: "Customer Rating", value: "5.0" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-surface-mid p-4">
                      <p className="mb-1 text-xs uppercase tracking-wider text-on-surface-variant" style={{ fontFamily: "var(--font-mono)" }}>
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
                <div className="aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="/cad_v.jpeg"
                    alt="Escalade V in the UFirst Limos fleet"
                    width={960}
                    height={960}
                    className="h-full w-full object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div aria-hidden="true" className="absolute -bottom-6 -left-6 h-32 w-32 rounded-xl border-2 border-lime/50" />
              </div>
            </div>
          </div>
        </section>

        <FleetShowcase
          vehicles={vehicles}
          onVehicleSelect={(vehicleId) => {
            setSelectedVehicleId(vehicleId);
            setShowBookingModal(true);
          }}
        />

        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          selectedVehicleId={selectedVehicleId}
          vehicles={vehicles}
        />

        <ReviewsSection />

        <footer className="border-t border-outline/20 px-6 py-12 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-lime">
                  <span className="text-lg font-bold text-black" style={{ fontFamily: "var(--font-display)" }}>
                    B
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-primary">UFirst Limos</p>
                  <p className="text-xs text-on-surface-variant">A subsidiary of Black Excellence Enterprises</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-on-surface-variant">
                <a
                  href="tel:+14436800071"
                  className="transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  +1 (443) 680-0071
                </a>
                <a
                  href="mailto:ufirstlimo@gmail.com"
                  className="transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                >
                  ufirstlimo@gmail.com
                </a>
              </div>
            </div>

            <div className="mt-8 border-t border-outline/20 pt-8 text-center text-sm text-on-surface-variant">
              <p>© 2026 Black Excellence Enterprises. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
