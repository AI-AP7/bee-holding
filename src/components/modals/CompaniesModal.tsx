"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useModalStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import SoundInquiryModal from "./SoundInquiryModal";
import ContractingInquiryModal from "./ContractingInquiryModal";
import { companies, type Company } from "@/lib/companies";

export default function CompaniesModal() {
  const { closeModal, companiesView, setCompaniesView, selectedCompanyIndex, setSelectedCompany } =
    useModalStore();
  const [showSoundInquiry, setShowSoundInquiry] = useState(false);
  const [showContractingInquiry, setShowContractingInquiry] = useState(false);

  const handleCompanyInquiry = (company: Company) => {
    if (company.inquiryType === "contracting") {
      setShowContractingInquiry(true);
      return;
    }

    setShowSoundInquiry(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl overflow-y-auto rounded-xl bg-surface-high ghost-border max-h-[calc(100vh-3rem)]"
      >
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-outline/15 p-4 pr-14 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pr-16">
        <h2
          className="text-display text-2xl text-primary sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          COMPANIES
        </h2>

        {/* View Toggle */}
        <div className="flex w-full items-center gap-2 rounded-lg bg-surface-mid p-1 sm:w-auto">
          <button
            onClick={() => setCompaniesView("slider")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all sm:flex-none ${
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
      <div className="p-4 sm:p-6">
        {companiesView === "slider" ? (
          <SliderView
            companies={companies}
            currentIndex={selectedCompanyIndex}
            setCurrentIndex={setSelectedCompany}
            onCompanyInquiry={handleCompanyInquiry}
          />
        ) : (
          <ListView companies={companies} onCompanyInquiry={handleCompanyInquiry} />
        )}
      </div>

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
    </motion.div>

    <SoundInquiryModal isOpen={showSoundInquiry} onClose={() => setShowSoundInquiry(false)} />
    <ContractingInquiryModal isOpen={showContractingInquiry} onClose={() => setShowContractingInquiry(false)} />
    </>
  );
}

function SliderView({
  companies,
  currentIndex,
  setCurrentIndex,
  onCompanyInquiry,
}: {
  companies: Company[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  onCompanyInquiry: (company: Company) => void;
}) {
  const current = companies[currentIndex];

  return (
    <div className="space-y-6">
      {/* Slider */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg sm:aspect-[16/10] lg:aspect-[21/9]">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gold text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                {current.tagline}
              </p>
              <h3 className="text-display mb-3 text-2xl text-primary sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                {current.name}
              </h3>
              <p className="mb-5 max-w-xl text-sm text-on-surface-variant sm:mb-6 sm:text-base">
                {current.description}
              </p>
              {current.href?.startsWith("/") ? (
                <Link
                  href={current.href}
                  className="inline-block px-8 py-3 font-bold text-sm uppercase tracking-wider transition-all btn-gold"
                >
                  {current.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onCompanyInquiry(current)}
                  className="inline-block px-8 py-3 font-bold text-sm uppercase tracking-wider transition-all btn-ghost"
                >
                  {current.cta}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex items-center justify-end gap-2">
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
  onCompanyInquiry,
}: {
  companies: Company[];
  onCompanyInquiry: (company: Company) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <p className="text-gold text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
              {company.tagline}
            </p>
            <h3 className="text-display text-2xl text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {company.name}
            </h3>
            <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
              {company.description}
            </p>
            {company.href?.startsWith("/") ? (
              <Link
                href={company.href}
                className="inline-block px-6 py-2 font-bold text-sm uppercase tracking-wider transition-all btn-gold"
              >
                {company.cta}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onCompanyInquiry(company)}
                className="inline-block px-6 py-2 font-bold text-sm uppercase tracking-wider transition-all btn-ghost"
              >
                {company.cta}
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
