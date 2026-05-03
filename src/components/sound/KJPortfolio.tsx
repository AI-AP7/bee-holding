"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const portfolioItems = [
  {
    type: "video",
    src: "/kj/events.mp4",
    label: "Event Production",
    span: "col-span-2 row-span-2",
  },
  {
    type: "image",
    src: "/kj/install1.jpg",
    label: "AV Installation",
    span: "",
  },
  {
    type: "image",
    src: "/kj/install2.jpg",
    label: "AV Installation",
    span: "",
  },
  {
    type: "image",
    src: "/kj/install3.jpg",
    label: "AV Installation",
    span: "",
  },
  {
    type: "image",
    src: "/kj/kj_sound.jpg",
    label: "Event Production",
    span: "",
  },
];

export default function KJPortfolio() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="portfolio"
      ref={ref}
      style={{
        background: "linear-gradient(180deg, #0b1326 0%, #0d1730 100%)",
        padding: "7rem 0",
        borderTop: "1px solid rgba(208,188,255,0.1)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <p className="kj-label mb-3">[ Our Work ]</p>
          <h2
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#dae2fd",
            }}
          >
            The Stage is Set.
          </h2>
        </motion.div>

        {/* Asymmetric Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "auto",
            gap: "0.75rem",
          }}
        >
          {/* Video tile — large, top-left, spans 2 cols and 2 rows */}
          <div
            className="relative overflow-hidden group"
            style={{
              gridColumn: "1 / span 2",
              gridRow: "1 / span 2",
              aspectRatio: "16/9",
              borderRadius: "0.5rem",
              border: "1px solid rgba(208,188,255,0.15)",
            }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ display: "block" }}
            >
              <source src="/kj/events.mp4" type="video/mp4" />
            </video>
            <div
              className="absolute inset-0 flex items-end p-5 opacity-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(to top, rgba(11,19,38,0.85) 0%, transparent 60%)",
                transition: "opacity 300ms ease",
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#ffe083",
                }}
              >
                Event Production
              </span>
            </div>
          </div>

          {/* Image tiles — right column */}
          {[
            { src: "/kj/install1.jpg", label: "AV Installation" },
            { src: "/kj/install2.jpg", label: "AV Installation" },
          ].map((item) => (
            <div
              key={item.src}
              className="relative overflow-hidden group"
              style={{
                borderRadius: "0.5rem",
                border: "1px solid rgba(208,188,255,0.12)",
                aspectRatio: "1",
              }}
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                style={{ objectFit: "cover", transition: "transform 600ms ease" }}
                sizes="33vw"
                className="group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(to top, rgba(11,19,38,0.85) 0%, transparent 60%)",
                  transition: "opacity 300ms ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#d0bcff",
                  }}
                >
                  {item.label}
                </span>
              </div>
            </div>
          ))}

          {/* Bottom row — 3 tiles across */}
          {[
            { src: "/kj/install3.jpg", label: "AV Installation" },
            { src: "/kj/kj_sound.jpg", label: "Event Production" },
          ].map((item) => (
            <div
              key={item.src}
              className="relative overflow-hidden group"
              style={{
                borderRadius: "0.5rem",
                border: "1px solid rgba(208,188,255,0.12)",
                aspectRatio: "16/9",
              }}
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                style={{ objectFit: "cover", transition: "transform 600ms ease" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(to top, rgba(11,19,38,0.85) 0%, transparent 60%)",
                  transition: "opacity 300ms ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: item.label === "Event Production" ? "#ffe083" : "#d0bcff",
                  }}
                >
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
