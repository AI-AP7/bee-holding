"use client";

import { useState } from "react";

const YOUTUBE_VIDEO_ID = "oyFTBhUNwKQ";
const MUSIC_SRC = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&modestbranding=1&rel=0&playsinline=1`;

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      {isPlaying && (
        <iframe
          className="pointer-events-none fixed -left-4 -top-4 h-px w-px opacity-0"
          src={MUSIC_SRC}
          title="Background music"
          allow="autoplay; encrypted-media"
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={() => setIsPlaying((current) => !current)}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-outline bg-surface-high/90 text-primary shadow-lg backdrop-blur transition-colors hover:border-primary hover:bg-surface-highest focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background"
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        title={isPlaying ? "Pause background music" : "Play background music"}
      >
        {isPlaying ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </button>
    </>
  );
}
