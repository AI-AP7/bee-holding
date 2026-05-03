"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const videos = [
  { id: "1", src: "/ufirstlimo-1.mov", alt: "UFirst Limos Trip 1" },
  { id: "2", src: "/ufirstlimo-2.mov", alt: "UFirst Limos Trip 2" },
  { id: "3", src: "/ufirstlimo-3.mov", alt: "UFirst Limos Trip 3" },
];

export default function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <div className="relative max-w-sm mx-auto">
      {/* Video Container - Portrait Mode */}
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-surface-high ghost-border">
        <AnimatePresence mode="wait">
          <motion.video
            key={videos[currentIndex].id}
            src={videos[currentIndex].src}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-surface-high/80 backdrop-blur-sm text-primary hover:bg-surface-highest transition-colors z-10"
        aria-label="Previous video"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-surface-high/80 backdrop-blur-sm text-primary hover:bg-surface-highest transition-colors z-10"
        aria-label="Next video"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-lime w-8"
                : "bg-outline hover:bg-on-surface-variant"
            }`}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
