"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface KJNavigationProps {
  onEventClick: () => void;
  onInstallClick: () => void;
}

export default function KJNavigation({ onEventClick, onInstallClick }: KJNavigationProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        backgroundColor: scrolled ? "rgba(11, 19, 38, 0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(208, 188, 255, 0.2)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        {/* Home Link */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-lime rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              B
            </span>
          </div>
          <span
            className="text-lime text-xs hidden md:block"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BLACK EXCELLENCE<br />
            <span className="text-[10px] text-on-surface-variant font-normal">ENTERPRISE</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Events", href: "#events" },
            { label: "Installations", href: "#installations" },
            { label: "Portfolio", href: "#portfolio" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-space font-semibold text-[0.8rem] tracking-[0.08em] uppercase text-[#958ea0] hover:text-[#dae2fd] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onEventClick}
            className="kj-btn-ghost"
            style={{ padding: "0.5rem 1.1rem", fontSize: "0.75rem" }}
          >
            Book Event
          </button>
          <button
            onClick={onInstallClick}
            className="px-[1.1rem] py-[0.5rem] rounded border border-[rgba(208,188,255,0.3)] bg-[rgba(208,188,255,0.1)] text-[#d0bcff] font-space font-semibold text-[0.75rem] tracking-[0.06em] uppercase cursor-pointer transition-all duration-250 hover:bg-[rgba(208,188,255,0.18)] hover:border-[rgba(208,188,255,0.6)]"
          >
            Get a Quote
          </button>
        </div>
      </div>
    </nav>
  );
}
