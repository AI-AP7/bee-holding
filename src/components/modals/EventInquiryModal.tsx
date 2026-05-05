"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface EventInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday & Milestone" },
  { value: "concert", label: "Concert / Live Music" },
  { value: "corporate", label: "Corporate Gala / Event" },
  { value: "festival", label: "Festival" },
  { value: "reunion", label: "Reunion" },
  { value: "other", label: "Other" },
];

const addonOptions = [
  { value: "moon_bounce", label: "Moon Bounce" },
  { value: "tables", label: "Tables" },
  { value: "chairs", label: "Chairs" },
  { value: "stage", label: "Stage Rental" },
  { value: "tents", label: "Tents" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  eventType: "",
  otherEventType: "",
  estimatedAttendance: "",
  eventDate: "",
  eventLocation: "",
  addons: [] as string[],
  notes: "",
};

export default function EventInquiryModal({ isOpen, onClose }: EventInquiryModalProps) {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddonToggle = (addon: string) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.includes(addon)
        ? prev.addons.filter((a) => a !== addon)
        : [...prev.addons, addon],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) return;
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const subject = `K&J Sound Event Inquiry — ${
        formData.eventType === "other" ? formData.otherEventType : formData.eventType
      }`;
      const body = `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Event Type: ${formData.eventType === "other" ? formData.otherEventType : formData.eventType}
Estimated Attendance: ${formData.estimatedAttendance}
Event Date: ${formData.eventDate}
Event Location: ${formData.eventLocation}
Add-ons: ${formData.addons.join(", ") || "None"}
Notes: ${formData.notes}`;

      window.location.href = `mailto:info@kjsoundcompany.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    !!formData.eventType &&
    !!formData.estimatedAttendance &&
    !!formData.eventDate &&
    !!formData.eventLocation;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(11, 19, 38, 0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl rounded-lg overflow-hidden max-h-[90vh] flex flex-col"
          style={{
            background: "rgba(17, 25, 46, 0.95)",
            border: "1px solid rgba(208, 188, 255, 0.2)",
            boxShadow: "0 0 60px rgba(208, 188, 255, 0.15), 0 24px 64px rgba(0,0,0,0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-7 py-5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(208, 188, 255, 0.15)" }}
          >
            <div>
              <p className="kj-label mb-1">K &amp; J Sound Company</p>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#dae2fd",
                  letterSpacing: "-0.02em",
                }}
              >
                Event Inquiry
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ color: "#958ea0" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dae2fd")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#958ea0")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-7 py-6 space-y-5">
            {submitStatus === "success" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(208, 188, 255, 0.15)", boxShadow: "0 0 32px rgba(208, 188, 255, 0.4)" }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d0bcff" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#d0bcff" }} className="mb-2">
                  Mail Client Opened
                </h3>
                <p style={{ color: "#958ea0" }}>Please send the prepared email from your mail app to complete the inquiry.</p>
              </motion.div>
            ) : (
              <>
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="kj-label block mb-2">Name *</label>
                    <input className="kj-input" type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="kj-label block mb-2">Email *</label>
                    <input className="kj-input" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div className="col-span-2">
                    <label className="kj-label block mb-2">Phone *</label>
                    <input className="kj-input" type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="(555) 123-4567" />
                  </div>
                </div>

                {/* Event Details */}
                <div>
                  <label className="kj-label block mb-2">Event Type *</label>
                  <div style={{ position: "relative" }}>
                    <select className="kj-select" value={formData.eventType} onChange={(e) => handleChange("eventType", e.target.value)}>
                      <option value="">Select event type...</option>
                      {eventTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#958ea0" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>

                {formData.eventType === "other" && (
                  <div>
                    <label className="kj-label block mb-2">Please Specify *</label>
                    <input className="kj-input" type="text" value={formData.otherEventType} onChange={(e) => handleChange("otherEventType", e.target.value)} placeholder="Describe your event" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="kj-label block mb-2">Estimated Attendance *</label>
                    <input className="kj-input" type="text" value={formData.estimatedAttendance} onChange={(e) => handleChange("estimatedAttendance", e.target.value)} placeholder="e.g. 150 guests" />
                  </div>
                  <div>
                    <label className="kj-label block mb-2">Event Date *</label>
                    <input className="kj-input" type="date" value={formData.eventDate} onChange={(e) => handleChange("eventDate", e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="kj-label block mb-2">Venue / Location *</label>
                  <input className="kj-input" type="text" value={formData.eventLocation} onChange={(e) => handleChange("eventLocation", e.target.value)} placeholder="Event venue address" />
                </div>

                {/* Add-ons */}
                <div>
                  <label className="kj-label block mb-3">Add-ons</label>
                  <div className="flex flex-wrap gap-2">
                    {addonOptions.map((addon) => {
                      const active = formData.addons.includes(addon.value);
                      return (
                        <button
                          key={addon.value}
                          type="button"
                          onClick={() => handleAddonToggle(addon.value)}
                          style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "0.25rem",
                            border: `1px solid ${active ? "#ffe083" : "rgba(149,142,160,0.3)"}`,
                            background: active ? "rgba(255,224,131,0.12)" : "transparent",
                            color: active ? "#ffe083" : "#958ea0",
                            fontFamily: "'Space Grotesk', system-ui, sans-serif",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            cursor: "pointer",
                            transition: "all 200ms ease",
                          }}
                        >
                          {addon.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="kj-label block mb-2">Additional Notes</label>
                  <textarea
                    className="kj-input"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Special requirements, questions, or anything else we should know..."
                    rows={3}
                    style={{ resize: "none" }}
                  />
                </div>

                {submitStatus === "error" && (
                  <div style={{ background: "rgba(255,180,171,0.1)", border: "1px solid #ffb4ab", borderRadius: "0.25rem", padding: "1rem", textAlign: "center" }}>
                    <p style={{ color: "#ffb4ab" }}>Something went wrong. Please try again.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {submitStatus !== "success" && (
            <div
              className="flex items-center justify-between px-7 py-5 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(208, 188, 255, 0.15)" }}
            >
              <button onClick={onClose} style={{ color: "#958ea0", fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: "0.875rem", cursor: "pointer", background: "none", border: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#dae2fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#958ea0")}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className="kj-btn-secondary"
                style={{ opacity: !isValid || isSubmitting ? 0.4 : 1, cursor: !isValid || isSubmitting ? "not-allowed" : "pointer" }}
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
