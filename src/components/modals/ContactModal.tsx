"use client";

import { motion } from "framer-motion";
import { useModalStore } from "@/lib/store";

export default function ContactModal() {
  const { closeModal } = useModalStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-lg bg-surface-high rounded-xl overflow-hidden ghost-border p-8"
    >
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
        className="text-display text-3xl text-primary mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        CONTACT
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        Get in touch with Black Excellence Enterprises
      </p>

      {/* Contact Options */}
      <div className="space-y-4 mb-8">
        {/* Email */}
        <a
          href="mailto:ufirstlimo@gmail.com"
          className="flex items-center gap-4 p-4 bg-surface-mid rounded-lg hover:bg-surface-highest transition-colors group"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-surface-highest rounded-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gold"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1">Email</p>
            <p className="text-on-surface group-hover:text-primary transition-colors">
              ufirstlimo@gmail.com
            </p>
          </div>
        </a>

        {/* Phone */}
        <a
          href="tel:+14105550123"
          className="flex items-center gap-4 p-4 bg-surface-mid rounded-lg hover:bg-surface-highest transition-colors group"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-surface-highest rounded-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gold"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1">Phone</p>
            <p className="text-on-surface group-hover:text-primary transition-colors">
              +1 (410) 555-0123
            </p>
          </div>
        </a>

        {/* Service Areas */}
        <div className="flex items-center gap-4 p-4 bg-surface-mid rounded-lg">
          <div className="w-12 h-12 flex items-center justify-center bg-surface-highest rounded-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-lime"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1">Service Areas</p>
            <p className="text-on-surface">
              Maryland, DC, Virginia, Pennsylvania
            </p>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
