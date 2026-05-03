"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

interface KJInstallationsProps {
  onInstallClick: () => void;
}

const venueTypes = [
  {
    icon: "⛪",
    label: "Churches",
    desc: "Worship-quality sound systems and programmable lighting that enhances every service.",
  },
  {
    icon: "🍽️",
    label: "Restaurants & Dining",
    desc: "Ambient audio zoning and architectural lighting that sets the perfect atmosphere.",
  },
  {
    icon: "🎶",
    label: "Nightlife Venues",
    desc: "Club-grade speaker arrays and dynamic lighting rigs built for maximum impact.",
  },
  {
    icon: "🏛️",
    label: "Corporate Spaces",
    desc: "Conference room AV, boardroom audio, and lobby ambiance systems.",
  },
];

const scopeOptions = ["Lighting", "Sound", "Both"];

const installPhotos = [
  { src: "/kj/install1.jpg", alt: "Installation project 1" },
  { src: "/kj/install2.jpg", alt: "Installation project 2" },
  { src: "/kj/install3.jpg", alt: "Installation project 3" },
];

export default function KJInstallations({ onInstallClick }: KJInstallationsProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeScope, setActiveScope] = useState("Both");

  return (
    <section
      id="installations"
      ref={ref}
      style={{
        background: "#0b1326",
        padding: "7rem 0",
        borderTop: "1px solid rgba(208,188,255,0.1)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="kj-label mb-4">[ AV Installations ]</p>
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#dae2fd",
              marginBottom: "1rem",
            }}
          >
            Built to Last.{" "}
            <span style={{ color: "#d0bcff" }}>Tuned to Perfection.</span>
          </h2>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              color: "#958ea0",
              maxWidth: "560px",
              margin: "0 auto 2rem",
            }}
          >
            Every installation is custom-scoped. We consult, design, and install permanent sound and lighting systems engineered for your venue&apos;s specific acoustic and aesthetic requirements — no templates, no shortcuts.
          </p>

          {/* Geographic callout */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "0.25rem",
              border: "1px solid rgba(255,224,131,0.25)",
              background: "rgba(255,224,131,0.06)",
            }}
          >
            <span style={{ color: "#ffe083", fontSize: "0.85rem" }}>📍</span>
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "#ffe083",
                textTransform: "uppercase",
              }}
            >
              Installation Projects Spanning the East Coast
            </span>
          </div>
        </motion.div>

        {/* Venue Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {venueTypes.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="kj-glass-card"
              style={{ padding: "1.75rem 1.25rem" }}
            >
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.875rem" }}>{v.icon}</span>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#dae2fd",
                  marginBottom: "0.5rem",
                }}
              >
                {v.label}
              </h3>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.875rem", lineHeight: 1.6, color: "#958ea0" }}>
                {v.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Scope Selector — decorative/visual only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <div
            style={{
              display: "flex",
              gap: "0",
              border: "1px solid rgba(208,188,255,0.2)",
              borderRadius: "0.375rem",
              overflow: "hidden",
            }}
          >
            {scopeOptions.map((opt) => {
              const active = activeScope === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setActiveScope(opt)}
                  style={{
                    padding: "0.625rem 1.5rem",
                    background: active ? "rgba(208,188,255,0.15)" : "transparent",
                    color: active ? "#d0bcff" : "#958ea0",
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    border: "none",
                    borderRight: opt !== "Both" ? "1px solid rgba(208,188,255,0.15)" : "none",
                    cursor: "pointer",
                    transition: "all 200ms ease",
                    boxShadow: active ? "0 0 16px rgba(208,188,255,0.2) inset" : "none",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Install Photo Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {installPhotos.map((photo, i) => (
            <div
              key={photo.src}
              className="relative overflow-hidden group"
              style={{
                aspectRatio: i === 1 ? "3/4" : "4/5",
                borderRadius: "0.5rem",
                border: "1px solid rgba(208,188,255,0.12)",
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                style={{ objectFit: "cover", transition: "transform 600ms ease" }}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="group-hover:scale-105"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(11,19,38,0.6) 0%, transparent 60%)",
                  transition: "opacity 300ms ease",
                }}
              />
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <button onClick={onInstallClick} className="kj-btn-primary" style={{ minWidth: "220px" }}>
            Start Your Project
          </button>
        </div>
      </div>
    </section>
  );
}
