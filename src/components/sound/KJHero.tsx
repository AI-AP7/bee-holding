"use client";

import { motion } from "framer-motion";

interface KJHeroProps {
  onEventClick: () => void;
  onInstallClick: () => void;
}

export default function KJHero({ onEventClick, onInstallClick }: KJHeroProps) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0b1326" }}
    >
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.35 }}
      >
        <source src="/kj/events.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,19,38,0.5) 0%, rgba(11,19,38,0.15) 40%, rgba(11,19,38,0.7) 100%)",
        }}
      />

      {/* Atmospheric Glow */}
      <div
        className="absolute"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(208,188,255,0.12) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="kj-label mb-6"
        >
          Maryland &amp; the East Coast
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2.8rem, 7vw, 5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#dae2fd",
            textShadow: "0 0 80px rgba(208,188,255,0.25)",
          }}
        >
          Sound That Commands.
          <br />
          <span style={{ color: "#d0bcff" }}>Lighting That Transforms.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "1.125rem",
            lineHeight: 1.6,
            color: "#958ea0",
            maxWidth: "560px",
            margin: "1.5rem auto 0",
          }}
        >
          Professional event production and custom AV installations — built for entertainment venues, corporations, and houses of worship across the East Coast.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <button onClick={onEventClick} className="kj-btn-secondary" style={{ minWidth: "200px" }}>
            Book Your Event
          </button>
          <button onClick={onInstallClick} className="kj-btn-primary" style={{ minWidth: "200px" }}>
            Plan an Installation
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2"
        style={{ transform: "translateX(-50%)" }}
      >
        <div
          style={{
            width: "1px",
            height: "60px",
            background: "linear-gradient(to bottom, rgba(208,188,255,0.6), transparent)",
            margin: "0 auto",
          }}
        />
      </motion.div>
    </section>
  );
}
