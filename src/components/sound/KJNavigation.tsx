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
      <div className="mx-auto flex h-auto max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:h-16 md:flex-nowrap md:px-12">
        {/* Home Link */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              B
            </span>
          </div>
          <span
            className="hidden text-xs text-gold sm:block"
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
        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          <button
            onClick={onEventClick}
            className="kj-btn-ghost flex-1 sm:flex-none"
            style={{ padding: "0.5rem 0.9rem", fontSize: "0.75rem" }}
          >
            Book Event
          </button>
          <button
            onClick={onInstallClick}
            className="flex-1 rounded border border-[rgba(208,188,255,0.3)] bg-[rgba(208,188,255,0.1)] px-[0.9rem] py-[0.5rem] text-[0.75rem] font-space font-semibold uppercase tracking-[0.06em] text-[#d0bcff] transition-all duration-250 hover:border-[rgba(208,188,255,0.6)] hover:bg-[rgba(208,188,255,0.18)] sm:flex-none sm:px-[1.1rem]"
          >
            Get a Quote
          </button>
        </div>
      </div>
    </nav>
  );
}
