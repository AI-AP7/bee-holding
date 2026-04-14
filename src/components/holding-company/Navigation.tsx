"use client";

import { useModalStore } from "@/lib/store";
import { motion } from "framer-motion";

export default function Navigation() {
  const { openModal } = useModalStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
            <span className="text-surface-high font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
              B
            </span>
          </div>
          <span
            className="text-primary text-sm hidden md:block"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BLACK EXCELLENCE<br />
            <span className="text-xs text-on-surface-variant font-normal">ENTERPRISES</span>
          </span>
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => openModal("companies")}
            className="nav-bracket px-3 py-2 md:px-4 md:py-2 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-high"
          >
            [COMPANIES]
          </button>
          <button
            onClick={() => openModal("about")}
            className="nav-bracket px-3 py-2 md:px-4 md:py-2 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-high"
          >
            [ABOUT]
          </button>
          <button
            onClick={() => openModal("contact")}
            className="nav-bracket px-3 py-2 md:px-4 md:py-2 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-high"
          >
            [CONTACT]
          </button>
        </div>
      </motion.div>
    </nav>
  );
}
