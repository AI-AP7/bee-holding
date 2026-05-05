"use client";

import { motion } from "framer-motion";
import { useModalStore } from "@/lib/store";
import Image from "next/image";

const aboutContent = {
  imageUrl: "/john_bernard.png",
  title: "Founder/Chairman",
  facts: [
    "Black Family Owned",
    "2 Businesses",
    "20+ Years of Experience",
  ],
  description:
    "Black Excellence Enterprise is a black owned corporation committed to delivering the highest quality service with every experience. Our subsidiaries have grown under the vision of our founder and chairman John Bernard. He is a husband, father, minister, and serial entrepreneur with nearly three decades of experience. We strive to bring our clients tailor made solutions that embody elegance and class.",
  tags: ["Family Owned", "Premium Service", "Strategic Vision", "Industry Leaders"],
};

export default function AboutModal() {
  const { closeModal } = useModalStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-surface-high ghost-border max-h-[calc(100vh-3rem)] overflow-y-auto"
    >
      <div className="grid md:grid-cols-2">
        {/* Left: Image */}
        <div className="relative h-64 bg-surface-mid sm:h-80 md:h-auto md:min-h-full">
          <Image
            src={aboutContent.imageUrl}
            alt="Black Excellence Enterprises leadership"
            fill
            className="object-contain object-top p-4 md:object-cover md:p-0"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-high via-transparent to-transparent md:bg-gradient-to-r" />
          <div className="absolute bottom-4 left-4 px-3 py-2 bg-gold text-xs font-bold uppercase tracking-wider text-black sm:bottom-6 sm:left-6 sm:px-4 sm:text-sm" style={{ fontFamily: "var(--font-mono)" }}>
            {aboutContent.title}
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex flex-col justify-center p-5 pr-14 sm:p-8 sm:pr-16 md:p-12">
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface-high/90 text-on-surface-variant transition-colors hover:text-primary sm:right-4 sm:top-4"
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2
            className="text-display mb-6 text-3xl text-primary sm:text-4xl md:mb-8 md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ABOUT
          </h2>

          {/* Facts */}
          <ul className="mb-6 space-y-3 md:mb-8 md:space-y-4">
            {aboutContent.facts.map((fact, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="flex items-start gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                <span className="text-on-surface">{fact}</span>
              </motion.li>
            ))}
          </ul>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 text-sm leading-relaxed text-on-surface-variant md:mb-8"
          >
            {aboutContent.description}
          </motion.p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {aboutContent.tags.map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="px-3 py-1.5 bg-surface-highest rounded-full text-xs uppercase tracking-wider text-on-surface-variant"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
