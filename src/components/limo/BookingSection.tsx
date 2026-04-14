"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const serviceAreas = [
  { code: "MD", name: "Maryland", baseFee: 0 },
  { code: "DC", name: "District of Columbia", baseFee: 25 },
  { code: "VA", name: "Virginia", baseFee: 50 },
  { code: "PA", name: "Pennsylvania", baseFee: 75 },
];

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  hourly_rate_local: number;
}

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequests: string;
}

export default function BookingSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availability, setAvailability] = useState<Record<string, Record<string, { available: boolean; status: string }>>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("10:00");
  const [serviceType, setServiceType] = useState<"hourly" | "point_to_point" | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    pickupLocation: "",
    dropoffLocation: "",
    specialRequests: "",
  });

  useEffect(() => {
    async function fetchData() {
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("id, name, slug, hourly_rate_local")
        .eq("is_active", true)
        .order("display_order");
      
      if (vehiclesData) setVehicles(vehiclesData);

      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const endDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split("T")[0];
      
      const { data: blocks } = await supabase
        .from("availability_blocks")
        .select("vehicle_id, block_date, block_type")
        .gte("block_date", startDate)
        .lte("block_date", endDate)
        .neq("block_type", "unavailable");

      const availMap: Record<string, Record<string, { available: boolean; status: string }>> = {};
      
      for (const v of vehiclesData || []) {
        availMap[v.id] = {};
        for (let d = 0; d < 30; d++) {
          const date = new Date();
          date.setDate(date.getDate() + d);
          const dateStr = date.toISOString().split("T")[0];
          availMap[v.id][dateStr] = { available: true, status: "ready" };
        }
      }

      for (const block of blocks || []) {
        if (availMap[block.vehicle_id]?.[block.block_date]) {
          availMap[block.vehicle_id][block.block_date] = {
            available: false,
            status: block.block_type === "booking" ? "reserved" : block.block_type,
          };
        }
      }

      setAvailability(availMap);
    }

    fetchData();
  }, []);

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      date: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      num: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedVehicle || !selectedDate || !serviceType || !selectedArea) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    const vehicle = vehicles.find((v) => v.id === selectedVehicle);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          vehicleSlug: vehicle?.slug,
          date: selectedDate,
          time: selectedTime,
          serviceType,
          serviceArea: selectedArea,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Booking failed");

      setSubmitStatus("success");
      setSelectedVehicle(null);
      setSelectedDate(null);
      setServiceType(null);
      setSelectedArea(null);
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        pickupLocation: "",
        dropoffLocation: "",
        specialRequests: "",
      });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
  const calculatePrice = () => {
    if (!selectedVehicleData || !serviceType) return null;
    if (serviceType === "hourly") return 510;
    const area = serviceAreas.find((a) => a.code === selectedArea);
    return selectedVehicleData.hourly_rate_local + (area?.baseFee || 0);
  };

  const getVehicleAvailability = (vehicleId: string, date: string) => {
    return availability[vehicleId]?.[date]?.available ?? true;
  };

  return (
    <section id="booking" className="py-24 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(189, 219, 55, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(189, 219, 55, 0.5) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div className="max-w-7xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="text-lime text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-mono)" }}>Reservation Protocol</p>
          <h2 className="text-display text-4xl md:text-5xl text-primary" style={{ fontFamily: "var(--font-display)" }}>BOOK NOW</h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface-mid rounded-xl p-6 ghost-border">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 flex items-center justify-center bg-lime text-black font-bold rounded-full" style={{ fontFamily: "var(--font-mono)" }}>1</span>
                <h3 className="text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>Select Vehicle</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => {
                  const isAvailable = selectedDate ? getVehicleAvailability(vehicle.id, selectedDate) : true;
                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => isAvailable && setSelectedVehicle(vehicle.id)}
                      disabled={!isAvailable}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        selectedVehicle === vehicle.id
                          ? "border-lime bg-lime/10"
                          : isAvailable
                            ? "border-outline hover:border-on-surface-variant"
                            : "border-outline/50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-on-surface">{vehicle.name}</p>
                          <p className="text-sm text-lime" style={{ fontFamily: "var(--font-mono)" }}>${vehicle.hourly_rate_local}/hr</p>
                        </div>
                        {!isAvailable && (
                          <span className="text-xs text-red-400">Reserved</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-surface-mid rounded-xl p-6 ghost-border">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 flex items-center justify-center bg-lime text-black font-bold rounded-full" style={{ fontFamily: "var(--font-mono)" }}>2</span>
                <h3 className="text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>Select Date & Time</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                {dates.map((d) => {
                  const isAnyAvailable = vehicles.some(v => getVehicleAvailability(v.id, d.date));
                  return (
                    <button
                      key={d.date}
                      onClick={() => isAnyAvailable && setSelectedDate(d.date)}
                      disabled={!isAnyAvailable}
                      className={`min-w-[64px] p-3 rounded-lg border transition-all ${
                        selectedDate === d.date
                          ? "border-lime bg-lime/10"
                          : isAnyAvailable
                            ? "border-outline hover:border-on-surface-variant"
                            : "border-outline/50 opacity-50"
                      }`}
                    >
                      <p className="text-xs text-on-surface-variant" style={{ fontFamily: "var(--font-mono)" }}>{d.day} {d.month}</p>
                      <p className="text-lg font-bold text-on-surface" style={{ fontFamily: "var(--font-mono)" }}>{d.num}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-on-surface-variant">Pickup Time:</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="bg-surface-high border border-outline rounded-lg px-4 py-2 text-on-surface focus:border-lime focus:outline-none"
                >
                  {times.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-surface-mid rounded-xl p-6 ghost-border">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 flex items-center justify-center bg-lime text-black font-bold rounded-full" style={{ fontFamily: "var(--font-mono)" }}>3</span>
                <h3 className="text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>Service Type</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <button onClick={() => setServiceType("hourly")} className={`p-4 rounded-lg border transition-all text-left ${serviceType === "hourly" ? "border-lime bg-lime/10" : "border-outline hover:border-on-surface-variant"}`}>
                  <p className="font-semibold text-on-surface mb-1">Hourly Service</p>
                  <p className="text-sm text-on-surface-variant">Minimum 4 hours</p>
                  <p className="text-sm text-lime mt-2" style={{ fontFamily: "var(--font-mono)" }}>From $510</p>
                </button>
                <button onClick={() => setServiceType("point_to_point")} className={`p-4 rounded-lg border transition-all text-left ${serviceType === "point_to_point" ? "border-lime bg-lime/10" : "border-outline hover:border-on-surface-variant"}`}>
                  <p className="font-semibold text-on-surface mb-1">Point to Point</p>
                  <p className="text-sm text-on-surface-variant">Airport & transfers</p>
                  <p className="text-sm text-lime mt-2" style={{ fontFamily: "var(--font-mono)" }}>Base + distance</p>
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-surface-mid rounded-xl p-6 ghost-border">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 flex items-center justify-center bg-lime text-black font-bold rounded-full" style={{ fontFamily: "var(--font-mono)" }}>4</span>
                <h3 className="text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>Contact Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Full Name *</label>
                  <input type="text" required value={formData.customerName} onChange={(e) => handleFormChange("customerName", e.target.value)} placeholder="John Smith" className="w-full bg-surface-high border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Email *</label>
                  <input type="email" required value={formData.customerEmail} onChange={(e) => handleFormChange("customerEmail", e.target.value)} placeholder="john@example.com" className="w-full bg-surface-high border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Phone *</label>
                  <input type="tel" required value={formData.customerPhone} onChange={(e) => handleFormChange("customerPhone", e.target.value)} placeholder="(555) 123-4567" className="w-full bg-surface-high border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Service Area *</label>
                  <select required value={selectedArea || ""} onChange={(e) => setSelectedArea(e.target.value)} className="w-full bg-surface-high border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none">
                    <option value="">Select area...</option>
                    {serviceAreas.map((area) => (<option key={area.code} value={area.code}>{area.name} {area.baseFee > 0 && `(+$${area.baseFee})`}</option>))}
                  </select>
                </div>
                {serviceType === "point_to_point" && (
                  <>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Pickup Location</label>
                      <input type="text" value={formData.pickupLocation} onChange={(e) => handleFormChange("pickupLocation", e.target.value)} placeholder="Airport or address" className="w-full bg-surface-high border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Dropoff Location</label>
                      <input type="text" value={formData.dropoffLocation} onChange={(e) => handleFormChange("dropoffLocation", e.target.value)} placeholder="Destination address" className="w-full bg-surface-high border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none" />
                    </div>
                  </>
                )}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-on-surface-variant mb-2">Special Requests</label>
                  <textarea value={formData.specialRequests} onChange={(e) => handleFormChange("specialRequests", e.target.value)} placeholder="Any special requirements..." rows={3} className="w-full bg-surface-high border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none resize-none" />
                </div>
              </div>
            </motion.div>

            {submitStatus === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-lime/20 border border-lime rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-lime rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-lime mb-2" style={{ fontFamily: "var(--font-display)" }}>Booking Submitted!</h3>
                <p className="text-on-surface-variant">We'll contact you shortly to confirm your reservation.</p>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 text-center">
                <p className="text-red-400">Something went wrong. Please try again or call us directly.</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!selectedVehicle || !selectedDate || !serviceType || !selectedArea || !formData.customerName || !formData.customerEmail || !formData.customerPhone || isSubmitting}
              className="w-full btn-lime py-4 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Initialize Booking"}
            </button>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-surface-mid rounded-xl p-6 ghost-border sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline/30">
                <span className="w-3 h-3 rounded-full bg-lime animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-lime" style={{ fontFamily: "var(--font-mono)" }}>Live Fleet Status</span>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1" style={{ fontFamily: "var(--font-mono)" }}>Units Available</p>
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>{vehicles.length} / {vehicles.length}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1" style={{ fontFamily: "var(--font-mono)" }}>Selected</p>
                  <p className="text-lg font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>{selectedVehicleData?.name || "None"}</p>
                </div>
                {selectedVehicleData && serviceType && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1" style={{ fontFamily: "var(--font-mono)" }}>Estimated Price</p>
                    <p className="text-3xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>${calculatePrice()}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-outline/30 text-center">
                <p className="text-sm text-on-surface-variant mb-2">Questions?</p>
                <a href="tel:+14105550123" className="text-primary hover:text-lime" style={{ fontFamily: "var(--font-mono)" }}>+1 (410) 555-0123</a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}