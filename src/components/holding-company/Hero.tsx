"use client";

import { motion } from "framer-motion";
import { useModalStore } from "@/lib/store";
import Image from "next/image";

export default function Hero() {
  const { openModal } = useModalStore();

  return (
    <section className="min-h-[70vh] flex flex-col justify-center px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto w-full pt-16 md:pt-24 pb-12 md:pb-16 border-b border-outline/30">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col items-center"
        >
          <Image
            src="/BEE_logo_transparent.png"
            alt="Black Excellence Enterprises"
            width={1200}
            height={675}
            className="mb-0 h-auto w-full max-w-2xl object-contain"
            sizes="(min-width: 1024px) 64rem, 100vw"
            priority
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-[-0.5rem] text-center text-base text-on-surface-variant md:mt-[-1rem] md:text-xl"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Commit to the Lord whatever you do, and he will establish your plans. — Proverbs 16:3
          </motion.p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <button
            onClick={() => openModal("companies")}
            className="btn-gold px-8 py-4 text-base sm:px-12 sm:py-5 sm:text-lg"
          >
            Explore Companies
          </button>
        </motion.div>

        {/* Stats / Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid gap-6 sm:grid-cols-3 sm:gap-8"
        >
          {[
            { label: "Companies", value: "2" },
            { label: "Experience", value: "20+ Years" },
            { label: "Commitment", value: "Excellence" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
              className="space-y-2 text-center"
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
    </section>
  );
}
