"use client";

import { motion } from "framer-motion";
import { useModalStore } from "@/lib/store";
import Link from "next/link";

export default function Hero() {
  const { openModal } = useModalStore();

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto w-full">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1
            className="text-display leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 12vw, 10rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            <motion.span
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block text-primary"
            >
              BLACK
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="block text-primary"
            >
              EXCELLENCE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="block"
              style={{
                color: "var(--color-tertiary)",
              }}
            >
              ENTERPRISES
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-12"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Building excellence through innovation, quality, and unwavering commitment to service across multiple industries.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            href="/limo"
            className="btn-lime px-8 py-4 text-sm"
          >
            Book Limo Service
          </Link>
          <button
            onClick={() => openModal("companies")}
            className="btn-ghost px-8 py-4 text-sm"
          >
            Explore Companies
          </button>
        </motion.div>

        {/* Stats / Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { label: "Service Areas", value: "4 States" },
            { label: "Fleet Size", value: "5+ Vehicles" },
            { label: "Established", value: "2024" },
            { label: "Commitment", value: "Excellence" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
              className="space-y-2"
            >
              <p
                className="text-xs uppercase tracking-widest text-on-surface-variant"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {stat.label}
              </p>
              <p
                className="text-2xl text-primary"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
              >
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span
          className="text-xs uppercase tracking-widest text-on-surface-variant"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border border-outline rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
