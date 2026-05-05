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
      className="relative w-full max-w-lg overflow-y-auto rounded-xl bg-surface-high p-5 pr-14 ghost-border max-h-[calc(100vh-3rem)] sm:p-8 sm:pr-16"
    >
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
        className="text-display mb-2 text-3xl text-primary"
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
          href="mailto:chairman@blkexcellenceenterprise.com"
          className="group flex items-start gap-4 rounded-lg bg-surface-mid p-4 transition-colors hover:bg-surface-highest"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-highest">
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
            <p className="break-all text-on-surface transition-colors group-hover:text-primary">
              chairman@blkexcellenceenterprise.com
            </p>
          </div>
        </a>

        {/* Phone */}
        <a
          href="tel:+14436800071"
          className="group flex items-start gap-4 rounded-lg bg-surface-mid p-4 transition-colors hover:bg-surface-highest"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-highest">
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
              +1 (443) 680-0071
            </p>
          </div>
        </a>

        {/* Service Areas */}
        <div className="flex items-start gap-4 rounded-lg bg-surface-mid p-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-highest">
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
