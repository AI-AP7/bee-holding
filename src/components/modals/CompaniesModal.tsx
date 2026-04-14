"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useModalStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  cta: string;
  href: string;
  isLimo: boolean;
}

const companies: Company[] = [
  {
    id: "ufirst-limos",
    name: "UFirst Limos",
    tagline: "Premium Transportation",
    description:
      "Luxury limousine service serving Maryland, DC, Virginia, and Pennsylvania. Experience elegance on wheels with our premium fleet.",
    imageUrl:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    cta: "Book Now",
    href: "/limo",
    isLimo: true,
  },
  {
    id: "kj-sound",
    name: "K & J Sound Company",
    tagline: "Professional Audio",
    description:
      "Professional audio and event production services. From intimate gatherings to large-scale events, we deliver crystal-clear sound.",
    imageUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    cta: "Email Inquiry",
    href: "mailto:info@blkexcellenceenterprise.com",
    isLimo: false,
  },
];

export default function CompaniesModal() {
  const { closeModal, companiesView, setCompaniesView, selectedCompanyIndex, setSelectedCompany } =
    useModalStore();

  const currentCompany = companies[selectedCompanyIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-5xl bg-surface-high rounded-xl overflow-hidden ghost-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-outline/15">
        <h2
          className="text-display text-3xl text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          COMPANIES
        </h2>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-surface-mid rounded-lg p-1">
          <button
            onClick={() => setCompaniesView("slider")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              companiesView === "slider"
                ? "bg-surface-highest text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Slider
          </button>
          <button
            onClick={() => setCompaniesView("list")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              companiesView === "list"
                ? "bg-surface-highest text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {companiesView === "slider" ? (
          <SliderView
            companies={companies}
            currentIndex={selectedCompanyIndex}
            setCurrentIndex={setSelectedCompany}
          />
        ) : (
          <ListView companies={companies} onClose={closeModal} />
        )}
      </div>

      {/* Close button */}
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors z-10"
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
    </motion.div>
  );
}

function SliderView({
  companies,
  currentIndex,
  setCurrentIndex,
}: {
  companies: Company[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}) {
  const current = companies[currentIndex];

  return (
    <div className="space-y-6">
      {/* Slider */}
      <div className="relative aspect-[21/9] rounded-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.imageUrl}
              alt={current.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-high via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Company Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-tertiary text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                {current.tagline}
              </p>
              <h3 className="text-display text-4xl text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {current.name}
              </h3>
              <p className="text-on-surface-variant max-w-xl mb-6">
                {current.description}
              </p>
              <Link
                href={current.href}
                className={`inline-block px-8 py-3 font-bold text-sm uppercase tracking-wider transition-all ${
                  current.isLimo
                    ? "bg-lime text-black hover:bg-lime/90"
                    : "btn-ghost"
                }`}
                onClick={() => {
                  if (current.isLimo) {
                    window.location.href = current.href;
                  }
                }}
              >
                {current.cta}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {/* Dots */}
        <div className="flex items-center gap-3">
          {companies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-outline hover:bg-on-surface-variant"
              }`}
              aria-label={`Go to company ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCurrentIndex((currentIndex - 1 + companies.length) % companies.length)
            }
            className="w-12 h-12 flex items-center justify-center rounded-full border border-outline hover:border-primary transition-colors"
            aria-label="Previous company"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((currentIndex + 1) % companies.length)}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-outline hover:border-primary transition-colors"
            aria-label="Next company"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ListView({
  companies,
  onClose,
}: {
  companies: Company[];
  onClose: () => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {companies.map((company, index) => (
        <motion.div
          key={company.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative bg-surface-mid rounded-lg overflow-hidden card-surface cursor-pointer"
        >
          <div className="relative h-48">
            <Image
              src={company.imageUrl}
              alt={company.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-high via-transparent to-transparent" />
          </div>
          <div className="p-6">
            <p className="text-tertiary text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
              {company.tagline}
            </p>
            <h3 className="text-display text-2xl text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {company.name}
            </h3>
            <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
              {company.description}
            </p>
            <Link
              href={company.href}
              className={`inline-block px-6 py-2 font-bold text-sm uppercase tracking-wider transition-all ${
                company.isLimo
                  ? "bg-lime text-black hover:bg-lime/90"
                  : "btn-ghost"
              }`}
            >
              {company.cta}
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
