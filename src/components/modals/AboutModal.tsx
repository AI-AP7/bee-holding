"use client";

import { motion } from "framer-motion";
import { useModalStore } from "@/lib/store";
import Image from "next/image";

const aboutContent = {
  imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80",
  facts: [
    "Established in 2024 with a vision for excellence",
    "Operating across Maryland, DC, Virginia, and Pennsylvania",
    "Committed to premium service and safety standards",
  ],
  description:
    "Black Excellence Enterprises is a diversified holding company dedicated to delivering exceptional service across complementary industries. Our portfolio of subsidiaries includes UFirst Limos, providing luxury transportation, and K & J Sound Company, offering professional audio solutions. Together, we embody our commitment to excellence in every interaction.",
  tags: ["Strategic Leadership", "Premium Services", "Innovation", "Safety First"],
};

export default function AboutModal() {
  const { closeModal } = useModalStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-4xl bg-surface-high rounded-xl overflow-hidden ghost-border"
    >
      <div className="grid md:grid-cols-2">
        {/* Left: Image */}
        <div className="relative h-64 md:h-auto">
          <Image
            src={aboutContent.imageUrl}
            alt="Black Excellence Enterprises leadership"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-high via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Right: Content */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
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
            className="text-display text-4xl md:text-5xl text-primary mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ABOUT
          </h2>

          {/* Facts */}
          <ul className="space-y-4 mb-8">
            {aboutContent.facts.map((fact, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="flex items-start gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-tertiary mt-2 flex-shrink-0" />
                <span className="text-on-surface">{fact}</span>
              </motion.li>
            ))}
          </ul>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-on-surface-variant text-sm leading-relaxed mb-8"
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
