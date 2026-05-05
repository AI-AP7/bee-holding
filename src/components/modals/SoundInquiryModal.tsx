"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SoundInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const installationTypes = [
  { value: "church", label: "Church" },
  { value: "restaurant", label: "Restaurant" },
  { value: "nightlife", label: "Nightlife Establishment" },
];

const installingOptions = [
  { value: "lights", label: "Lights" },
  { value: "sound", label: "Sound" },
  { value: "both", label: "Both" },
];

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "concert", label: "Concert" },
  { value: "reunion", label: "Reunion" },
  { value: "festival", label: "Festival" },
  { value: "corporate", label: "Corporate" },
  { value: "other", label: "Other" },
];

const addonOptions = [
  { value: "moon_bounce", label: "Moon Bounce" },
  { value: "tables", label: "Tables" },
  { value: "chairs", label: "Chairs" },
  { value: "stage", label: "Stage Rental" },
  { value: "tents", label: "Tents" },
];

export default function SoundInquiryModal({ isOpen, onClose }: SoundInquiryModalProps) {
  const [inquiryType, setInquiryType] = useState<"event" | "installation">("event");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    otherEventType: "",
    estimatedAttendance: "",
    eventDate: "",
    eventLocation: "",
    installationType: "",
    installing: "",
    location: "",
    capacity: "",
    addons: [] as string[],
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (field: string, value: string | string[]) => {
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
      const subject = inquiryType === "event" 
        ? `K&J Sound Event Inquiry - ${formData.eventType}`
        : `K&J Sound Installation Inquiry - ${formData.installationType}`;
      
      const body = inquiryType === "event"
        ? `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Event Type: ${formData.eventType === "other" ? formData.otherEventType : formData.eventType}
Estimated Attendance: ${formData.estimatedAttendance}
Event Date: ${formData.eventDate}
Event Location: ${formData.eventLocation}
Add-ons: ${formData.addons.join(", ") || "None"}
Notes: ${formData.notes}`
        : `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Installation Type: ${formData.installationType}
Installing: ${formData.installing}
Location: ${formData.location}
Capacity: ${formData.capacity}
Notes: ${formData.notes}`;

      window.location.href = `mailto:chairman@blkexcellenceenterprise.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      setSubmitStatus("success");
      setTimeout(() => {
        onClose();
        setSubmitStatus("idle");
        setFormData({
          name: "",
          email: "",
          phone: "",
          eventType: "",
          otherEventType: "",
          estimatedAttendance: "",
          eventDate: "",
          eventLocation: "",
          installationType: "",
          installing: "",
          location: "",
          capacity: "",
          addons: [],
          notes: "",
        });
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-surface-high rounded-xl overflow-hidden ghost-border max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-surface-high">
            <div className="flex items-center justify-between p-6 border-b border-outline/30">
              <div>
                <p className="text-lime text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                  K & J Sound Company
                </p>
                <h3 className="text-2xl text-primary font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Request Quote
                </h3>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 p-4 border-b border-outline/20">
              <button
                onClick={() => setInquiryType("event")}
                className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                  inquiryType === "event"
                    ? "bg-lime text-black font-bold"
                    : "text-on-surface-variant hover:text-lime"
                }`}
              >
                Event
              </button>
              <button
                onClick={() => setInquiryType("installation")}
                className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                  inquiryType === "installation"
                    ? "bg-lime text-black font-bold"
                    : "text-on-surface-variant hover:text-lime"
                }`}
              >
                Installation
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {submitStatus === "success" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-20 h-20 bg-lime rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-lime mb-2">Mail Client Opened</h3>
                <p className="text-on-surface-variant">Please send the prepared email from your mail app to complete the inquiry.</p>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-on-surface-variant mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-on-surface-variant mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                    />
                  </div>
                </div>

                {inquiryType === "event" ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Event Type *</label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => handleChange("eventType", e.target.value)}
                        className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface"
                      >
                        <option value="">Select event type...</option>
                        {eventTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {formData.eventType === "other" && (
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Please specify *</label>
                        <input
                          type="text"
                          value={formData.otherEventType}
                          onChange={(e) => handleChange("otherEventType", e.target.value)}
                          placeholder="Describe your event"
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Estimated Attendance *</label>
                        <input
                          type="text"
                          value={formData.estimatedAttendance}
                          onChange={(e) => handleChange("estimatedAttendance", e.target.value)}
                          placeholder="e.g., 100 guests"
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Date *</label>
                        <input
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => handleChange("eventDate", e.target.value)}
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Location *</label>
                      <input
                        type="text"
                        value={formData.eventLocation}
                        onChange={(e) => handleChange("eventLocation", e.target.value)}
                        placeholder="Event venue address"
                        className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-on-surface-variant mb-3">Add-ons</label>
                      <div className="flex flex-wrap gap-3">
                        {addonOptions.map((addon) => (
                          <button
                            key={addon.value}
                            onClick={() => handleAddonToggle(addon.value)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              formData.addons.includes(addon.value)
                                ? "border-lime bg-lime/10 text-lime"
                                : "border-outline text-on-surface-variant hover:border-lime"
                            }`}
                          >
                            {addon.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Installation Type *</label>
                      <select
                        value={formData.installationType}
                        onChange={(e) => handleChange("installationType", e.target.value)}
                        className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface"
                      >
                        <option value="">Select type...</option>
                        {installationTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Installing *</label>
                      <select
                        value={formData.installing}
                        onChange={(e) => handleChange("installing", e.target.value)}
                        className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface"
                      >
                        <option value="">Select...</option>
                        {installingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Location *</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          placeholder="Installation address"
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Capacity</label>
                        <input
                          type="text"
                          value={formData.capacity}
                          onChange={(e) => handleChange("capacity", e.target.value)}
                          placeholder="e.g., 200 seats"
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any special requirements or questions..."
                    rows={3}
                    className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none resize-none"
                  />
                </div>

                {submitStatus === "error" && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
                    <p className="text-red-400">Something went wrong. Please try again.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {submitStatus !== "success" && (
            <div className="sticky bottom-0 bg-surface-high p-6 border-t border-outline/30">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-on-surface-variant hover:text-primary transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !formData.name || !formData.email || !formData.phone ||
                    (inquiryType === "event" && (!formData.eventType || !formData.estimatedAttendance || !formData.eventDate || !formData.eventLocation)) ||
                    (inquiryType === "installation" && (!formData.installationType || !formData.installing || !formData.location))
                  }
                  className="btn-lime px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Request Quote"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
