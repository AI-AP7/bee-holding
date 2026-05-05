"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ContractingInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  projectDescription: "",
};

export default function ContractingInquiryModal({ isOpen, onClose }: ContractingInquiryModalProps) {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const subject = "Contracting Consultation Inquiry";
      const body = `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Project Description: ${formData.projectDescription}`;

      window.location.href = `mailto:chairman@blkexcellenceenterprise.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setSubmitStatus("success");
      setTimeout(() => {
        onClose();
        setSubmitStatus("idle");
        setFormData(initialForm);
      }, 2000);
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    !!formData.name &&
    !!formData.email &&
    !!formData.phone &&
    !!formData.projectDescription;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 p-3 pb-6 pt-6 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex max-h-[calc(100vh-3rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-surface-high ghost-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-outline/30 p-4 sm:p-6">
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-gold" style={{ fontFamily: "var(--font-mono)" }}>
                Contracting Consultation
              </p>
              <h3 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                Project Inquiry
              </h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center text-on-surface-variant transition-colors hover:text-primary"
              aria-label="Close contracting inquiry modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {submitStatus === "success" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gold">Mail Client Opened</h3>
                <p className="text-on-surface-variant">
                  Please send the prepared email from your mail app to complete the inquiry.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-on-surface-variant">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-lg border border-outline bg-surface-mid px-4 py-3 text-on-surface focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-on-surface-variant">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-lg border border-outline bg-surface-mid px-4 py-3 text-on-surface focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm text-on-surface-variant">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(443) 680-0071"
                      className="w-full rounded-lg border border-outline bg-surface-mid px-4 py-3 text-on-surface focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm text-on-surface-variant">Project Description *</label>
                    <textarea
                      value={formData.projectDescription}
                      onChange={(e) => handleChange("projectDescription", e.target.value)}
                      placeholder="Tell us about the build, timeline, location, and the type of support you need."
                      rows={5}
                      className="w-full resize-none rounded-lg border border-outline bg-surface-mid px-4 py-3 text-on-surface focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                {submitStatus === "error" && (
                  <div className="rounded-lg border border-red-300/60 bg-red-400/10 p-4 text-center text-red-200">
                    Something went wrong. Please try again.
                  </div>
                )}
              </>
            )}
          </div>

          {submitStatus !== "success" && (
            <div className="flex flex-shrink-0 flex-col-reverse gap-3 border-t border-outline/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <button
                onClick={onClose}
                className="text-left text-sm text-on-surface-variant transition-colors hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className="btn-gold w-full px-6 py-3 text-sm sm:w-auto"
                style={{ opacity: !isValid || isSubmitting ? 0.4 : 1 }}
              >
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
