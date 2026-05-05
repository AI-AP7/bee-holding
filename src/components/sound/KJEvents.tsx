"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

interface KJEventsProps {
  onEventClick: () => void;
}

const eventTypes = [
  { icon: "💍", label: "Weddings" },
  { icon: "🎂", label: "Birthdays & Milestones" },
  { icon: "🏢", label: "Corporate Galas" },
  { icon: "🎵", label: "Concerts & Live Music" },
  { icon: "🎪", label: "Festivals" },
  { icon: "🤝", label: "Reunions" },
];

const addons = ["Moon Bounce", "Tables & Chairs", "Stage Rental", "Tents"];

export default function KJEvents({ onEventClick }: KJEventsProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="events"
      ref={ref}
      style={{
        background: "linear-gradient(180deg, #0b1326 0%, #0e1630 100%)",
        padding: "7rem 0",
        borderTop: "1px solid rgba(208,188,255,0.1)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="kj-label mb-4">[ Event Production ]</p>
            <h2
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#dae2fd",
                marginBottom: "1.25rem",
              }}
            >
              We Run the Show.
            </h2>
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "#958ea0",
                marginBottom: "2rem",
              }}
            >
              K&amp;J delivers full-stack production — professional-grade sound systems, intelligent lighting rigs, and custom staging — so your event sounds as good as it looks. We handle the technical so you can focus on the experience.
            </p>

            {/* Event Type Grid */}
            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {eventTypes.map((e, i) => (
                <motion.div
                  key={e.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="kj-glass-card flex items-center gap-3"
                  style={{ padding: "0.875rem 1rem" }}
                >
                  <span style={{ fontSize: "1.25rem" }}>{e.icon}</span>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#dae2fd",
                    }}
                  >
                    {e.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Add-ons */}
            <div className="mb-8">
              <p className="kj-label mb-3">Available Add-ons</p>
              <div className="flex flex-wrap gap-2">
                {addons.map((a) => (
                  <span
                    key={a}
                    style={{
                      padding: "0.375rem 0.875rem",
                      borderRadius: "0.25rem",
                      border: "1px solid rgba(255,224,131,0.25)",
                      background: "rgba(255,224,131,0.06)",
                      color: "#ffe083",
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={onEventClick} className="kj-btn-secondary">
              Book Your Event
            </button>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
            style={{ aspectRatio: "4/5", borderRadius: "0.5rem", overflow: "hidden" }}
          >
            <Image
              src="/kj/kj_sound.jpg"
              alt="K&J Sound event production"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(11,19,38,0.7) 0%, transparent 50%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "1px solid rgba(208,188,255,0.15)",
                borderRadius: "0.5rem",
                pointerEvents: "none",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
