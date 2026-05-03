"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  hourly_rate_local: number;
  four_hour_block_local: number;
  minHours: number;
}

const serviceAreas = [
  { code: "MD", name: "Maryland", baseFee: 0 },
  { code: "DC", name: "District of Columbia", baseFee: 25 },
  { code: "VA", name: "Virginia", baseFee: 50 },
  { code: "PA", name: "Pennsylvania", baseFee: 75 },
];

const addOns = [
  { id: "red-carpet", name: "10ft Red Carpet", price: 45, category: "service" },
  { id: "beer", name: "Beer", price: 30, category: "alcohol" },
  { id: "liquor", name: "Liquor", price: 60, category: "alcohol" },
  { id: "wine", name: "Wine", price: 25, category: "alcohol" },
  { id: "champagne", name: "Champagne", price: 80, category: "alcohol" },
  { id: "snacks", name: "Snacks & Chips", price: 10, category: "food" },
  { id: "condoms", name: "Condoms", price: 5, category: "other" },
  { id: "flowers", name: "Flowers", price: 25, category: "service" },
  { id: "balloons", name: "Balloons", price: 10, category: "service" },
];

const steps = [
  { id: 1, label: "Service Time" },
  { id: 2, label: "Add-ons" },
  { id: 3, label: "Contact Info" },
  { id: 4, label: "Confirm" },
  { id: 5, label: "Payment" },
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicleId: string | null;
}

export default function BookingModal({ isOpen, onClose, selectedVehicleId }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(selectedVehicleId);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("10:00");
  const [selectedHours, setSelectedHours] = useState<number>(1);
  const [serviceType, setServiceType] = useState<"hourly" | "destination">("hourly");
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [dropoffLocation, setDropoffLocation] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("MD");
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
  });
  const [selectedAddOns, setSelectedAddOns] = useState<{ id: string; name: string; price: number }[]>([]);
  const [selectedAlcohol, setSelectedAlcohol] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [squareCustomerId, setSquareCustomerId] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<string>("");
  const [cardNonce, setCardNonce] = useState<string | null>(null);

  const getMonthData = (offset: number) => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const monthName = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
    const firstDay = monthStart.getDay();
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: "", empty: true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), i);
      days.push({
        day: i,
        date: date.toISOString().split("T")[0],
        today: date.toDateString() === today.toDateString(),
      });
    }
    
    return { monthName, days };
  };

  const currentMonth = getMonthData(currentMonthOffset);
  const nextMonth = getMonthData(currentMonthOffset + 1);

  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  useEffect(() => {
    async function fetchVehicles() {
      const { data } = await supabase
        .from("vehicles")
        .select("id, name, slug, hourly_rate_local, four_hour_block_local, min_hours")
        .eq("is_active", true)
        .order("display_order");
      if (data) setVehicles(data);
    }
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicleId) setSelectedVehicle(selectedVehicleId);
  }, [selectedVehicleId]);

  useEffect(() => {
    if (selectedVehicleData?.minHours && selectedHours < selectedVehicleData.minHours) {
      setSelectedHours(selectedVehicleData.minHours);
    }
  }, [selectedVehicle]);

  const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
  
  const FUEL_FEE_RATE = 0.10;
  const TAX_RATE = 0.06;
  const GRatuity = 60;

  const calculatePrice = () => {
    if (!selectedVehicleData) return 0;
    let baseRate = selectedVehicleData.hourly_rate_local;
    const area = serviceAreas.find((a) => a.code === selectedArea);
    const areaFee = area?.baseFee || 0;
    
    let targetVehicle = selectedVehicleData;
    if (serviceType === "destination") {
      targetVehicle = vehicles.find(v => v.slug === "black-stretch-limo") || selectedVehicleData;
    }
    
    // Enforce 4-hour minimum for White Stretch, S-Class, and Escalade
    const fourHourVehicles = ["white-stretch-limo", "mercedes-s-class", "escalade-esv"];
    const effectiveHours = (serviceType === "hourly" && fourHourVehicles.includes(targetVehicle.slug))
      ? Math.max(selectedHours, 4)
      : selectedHours;
    
    if (serviceType === "hourly" && effectiveHours >= 4) {
      return targetVehicle.four_hour_block_local + areaFee;
    }
    
    if (serviceType === "destination") {
      return targetVehicle.hourly_rate_local + areaFee;
    }
    
    return (targetVehicle.hourly_rate_local * effectiveHours) + areaFee;
  };

  const calculateTotalWithFees = () => {
    const subtotal = calculatePrice();
    const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
    const fuelFee = (subtotal + addOnsTotal) * FUEL_FEE_RATE;
    const tax = (subtotal + addOnsTotal) * TAX_RATE;
    const gratuity = GRatuity;
    return {
      subtotal: subtotal + addOnsTotal,
      addOnsTotal,
      fuelFee,
      tax,
      gratuity,
      total: subtotal + addOnsTotal + fuelFee + tax + gratuity
    };
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const createSquareCustomer = async () => {
    try {
      const response = await fetch("/api/square/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
        }),
      });
      const data = await response.json();
      if (data.customer?.id) {
        setSquareCustomerId(data.customer.id);
        return data.customer.id;
      }
      return null;
    } catch (error) {
      console.error("Square customer error:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedVehicle || !selectedDate || !selectedArea || !formData.customerName || !formData.customerEmail || !formData.customerPhone || !pickupLocation) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const customerId = await createSquareCustomer();

      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          date: selectedDate,
          time: selectedTime,
          hours: selectedHours,
          serviceType: serviceType,
          serviceArea: selectedArea,
          pickupLocation,
          dropoffLocation: serviceType === "destination" ? dropoffLocation : "",
          customerId: customerId,
          ...formData,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Booking failed");

      setSubmitStatus("success");
    } catch (error) {
      console.error("Booking error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processPayment = async () => {
    if (!cardNonce) {
      setCardErrors("Please enter card details");
      return;
    }

    setIsSubmitting(true);
    setCardErrors("");

    try {
      const response = await fetch("/api/square/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: cardNonce,
          amount: calculateTotalWithFees().total,
          idempotencyKey: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          customerId: squareCustomerId,
          note: `Limo Booking - ${selectedVehicleData?.name}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment failed");

      onClose();
    } catch (error) {
      console.error("Payment error:", error);
      setCardErrors("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
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
                  Reservation Protocol
                </p>
                <h3 className="text-2xl text-primary font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  BOOK NOW
                </h3>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 p-4 border-b border-outline/20">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => submitStatus !== "success" && setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    currentStep === step.id
                      ? "bg-lime text-black font-bold"
                      : step.id < currentStep
                      ? "bg-lime/20 text-lime"
                      : "text-on-surface-variant"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-current text-xs">
                    {step.id < currentStep ? "✓" : step.id}
                  </span>
                  <span className="text-xs uppercase hidden sm:inline">{step.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 min-h-[400px]">
            {submitStatus === "success" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-20 h-20 bg-lime rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-lime mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  RESERVATION CONFIRMED
                </h3>
                <p className="text-on-surface-variant mb-8">
                  A confirmation email has been sent to {formData.customerEmail}.
                </p>
                <button onClick={onClose} className="btn-lime px-8 py-3">
                  Done
                </button>
              </motion.div>
            ) : (
              <>
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-3">Select Vehicle *</label>
                      {serviceType === "destination" && (
                        <p className="text-lime text-xs mb-2">Destination service is only available with Black Stretch Limo</p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vehicles
                          .filter(v => serviceType === "destination" ? v.slug === "black-stretch-limo" : true)
                          .map((vehicle) => (
                          <button
                            key={vehicle.id}
                            onClick={() => setSelectedVehicle(vehicle.id)}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              selectedVehicle === vehicle.id
                                ? "border-lime bg-lime/10"
                                : "border-outline hover:border-on-surface-variant"
                            }`}
                          >
                            <p className="font-semibold text-on-surface text-sm">{vehicle.name}</p>
                            <p className="text-lime text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                              ${vehicle.hourly_rate_local}/hr
                              {vehicle.minHours > 1 && ` (${vehicle.minHours}hr min)`}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-on-surface-variant mb-3">Service Type *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setServiceType("hourly")}
                          className={`p-4 rounded-lg border transition-all ${
                            serviceType === "hourly"
                              ? "border-lime bg-lime/10"
                              : "border-outline hover:border-on-surface-variant"
                          }`}
                        >
                          <p className="font-semibold text-on-surface">Hourly Service</p>
                          <p className="text-lime text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                            ${selectedVehicleData?.four_hour_block_local || 510} for 4 hrs
                          </p>
                        </button>
                        <button
                          onClick={() => setServiceType("destination")}
                          className={`p-4 rounded-lg border transition-all ${
                            serviceType === "destination"
                              ? "border-lime bg-lime/10"
                              : "border-outline hover:border-on-surface-variant"
                          }`}
                        >
                          <p className="font-semibold text-on-surface">Destination</p>
                          <p className="text-lime text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                            Base + distance
                          </p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Pickup Location *</label>
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        placeholder="123 Main St, City, State"
                        className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                      />
                    </div>

                    {serviceType === "destination" && (
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Dropoff Location *</label>
                        <input
                          type="text"
                          value={dropoffLocation}
                          onChange={(e) => setDropoffLocation(e.target.value)}
                          placeholder="456 Destination, City, State"
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm text-on-surface-variant">Select Date *</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentMonthOffset(Math.max(0, currentMonthOffset - 1))}
                            disabled={currentMonthOffset === 0}
                            className="p-2 text-on-surface-variant hover:text-lime disabled:opacity-30"
                          >
                            ← Prev
                          </button>
                          <button
                            onClick={() => setCurrentMonthOffset(currentMonthOffset + 1)}
                            disabled={currentMonthOffset >= 2}
                            className="p-2 text-on-surface-variant hover:text-lime disabled:opacity-30"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-surface-mid rounded-lg p-4">
                        <p className="text-center text-lime font-bold mb-3">{currentMonth.monthName}</p>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                            <span key={i} className="text-xs text-on-surface-variant">{d}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {currentMonth.days.map((d, i) => (
                            <button
                              key={i}
                              disabled={d.empty || (currentMonthOffset === 0 && d.today)}
                              onClick={() => d.date && setSelectedDate(d.date)}
                              className={`w-10 h-10 rounded text-sm transition-all ${
                                d.empty ? "invisible" :
                                selectedDate === d.date
                                  ? "bg-lime text-black font-bold"
                                  : d.today
                                  ? "border border-lime text-lime"
                                  : "hover:bg-surface-highest hover:text-lime"
                              }`}
                            >
                              {d.day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Pickup Time</label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface"
                        >
                          {times.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Service Area</label>
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface"
                        >
                          {serviceAreas.map((area) => (
                            <option key={area.code} value={area.code}>
                              {area.name} {area.baseFee > 0 && `(+$${area.baseFee})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {serviceType === "hourly" && (
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-3">Duration *</label>
                        {selectedVehicleData?.minHours && selectedVehicleData.minHours > 1 && (
                          <p className="text-lime text-xs mb-2">{selectedVehicleData.name} requires {selectedVehicleData.minHours}-hour minimum</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((hrs) => {
                            const isDisabled = selectedVehicleData?.minHours ? hrs < selectedVehicleData.minHours : false;
                            return (
                              <button
                                key={hrs}
                                onClick={() => !isDisabled && setSelectedHours(hrs)}
                                disabled={isDisabled}
                                className={`px-4 py-2 rounded-lg border transition-all ${
                                  isDisabled
                                    ? "border-outline/30 text-outline/30 cursor-not-allowed"
                                    : selectedHours === hrs
                                    ? "border-lime bg-lime/10"
                                    : "border-outline hover:border-lime"
                                }`}
                              >
                                <span className="text-on-surface">{hrs} hr{hrs > 1 ? "s" : ""}</span>
                                {hrs >= 4 && <span className="text-lime text-xs ml-1">★</span>}
                              </button>
                            );
                          })}
                        </div>
                        {selectedHours >= 4 ? (
                          <p className="text-lime text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                            4 Hour Bundle: ${selectedVehicleData?.four_hour_block_local || 510} (Discount Applied!)
                          </p>
                        ) : (
                          <p className="text-on-surface-variant text-sm">
                            ${selectedVehicleData?.hourly_rate_local || 140}/hr × {selectedHours} hr = ${(selectedVehicleData?.hourly_rate_local || 140) * selectedHours}
                          </p>
                        )}
                      </div>
                    )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-primary mb-2">Ride Bonuses</h4>
                  <p className="text-sm text-on-surface-variant">Select add-ons for your limo experience</p>
                </div>

                {/* Red Carpet */}
                <div className="bg-surface-mid rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-on-surface">10ft Red Carpet</p>
                      <p className="text-xs text-on-surface-variant">Make a grand entrance</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lime font-bold">$45.00</span>
                      <button
                        onClick={() => {
                          const exists = selectedAddOns.find(a => a.id === "red-carpet");
                          if (exists) {
                            setSelectedAddOns(selectedAddOns.filter(a => a.id !== "red-carpet"));
                          } else {
                            setSelectedAddOns([...selectedAddOns, { id: "red-carpet", name: "10ft Red Carpet", price: 45 }]);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedAddOns.find(a => a.id === "red-carpet")
                            ? "bg-lime text-black"
                            : "bg-surface-high text-on-surface-variant border border-outline hover:border-lime"
                        }`}
                      >
                        {selectedAddOns.find(a => a.id === "red-carpet") ? "Added ✓" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Alcohol Section */}
                <div>
                  <div className="bg-surface-mid rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-surface-high">
                      <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Alcohol Beverages</p>
                    </div>
                    {["beer", "liquor", "wine", "champagne"].map((type) => {
                      const item = addOns.find(a => a.id === type)!;
                      const isSelected = selectedAddOns.find(a => a.id === type);
                      return (
                        <div key={type} className="flex items-center justify-between px-4 py-3 border-t border-outline/20">
                          <span className="text-on-surface">{item.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-lime font-bold w-16 text-right">${item.price}</span>
                            <button
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAddOns(selectedAddOns.filter(a => a.id !== type));
                                } else {
                                  setSelectedAddOns([...selectedAddOns, { id: item.id, name: item.name, price: item.price }]);
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all min-w-[80px] ${
                                isSelected
                                  ? "bg-lime text-black"
                                  : "bg-surface-high text-on-surface-variant border border-outline hover:border-lime"
                              }`}
                            >
                              {isSelected ? "Added ✓" : "Add"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Food Section */}
                <div>
                  <div className="bg-surface-mid rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-surface-high">
                      <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Food</p>
                    </div>
                    {["snacks"].map((type) => {
                      const item = addOns.find(a => a.id === type)!;
                      const isSelected = selectedAddOns.find(a => a.id === type);
                      return (
                        <div key={type} className="flex items-center justify-between px-4 py-3 border-t border-outline/20">
                          <span className="text-on-surface">{item.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-lime font-bold w-16 text-right">${item.price}</span>
                            <button
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAddOns(selectedAddOns.filter(a => a.id !== type));
                                } else {
                                  setSelectedAddOns([...selectedAddOns, { id: item.id, name: item.name, price: item.price }]);
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all min-w-[80px] ${
                                isSelected
                                  ? "bg-lime text-black"
                                  : "bg-surface-high text-on-surface-variant border border-outline hover:border-lime"
                              }`}
                            >
                              {isSelected ? "Added ✓" : "Add"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Other Section */}
                <div>
                  <div className="bg-surface-mid rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-surface-high">
                      <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Other</p>
                    </div>
                    {["condoms", "flowers", "balloons"].map((type) => {
                      const item = addOns.find(a => a.id === type)!;
                      const isSelected = selectedAddOns.find(a => a.id === type);
                      return (
                        <div key={type} className="flex items-center justify-between px-4 py-3 border-t border-outline/20">
                          <span className="text-on-surface">{item.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-lime font-bold w-16 text-right">${item.price}</span>
                            <button
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAddOns(selectedAddOns.filter(a => a.id !== type));
                                } else {
                                  setSelectedAddOns([...selectedAddOns, { id: item.id, name: item.name, price: item.price }]);
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all min-w-[80px] ${
                                isSelected
                                  ? "bg-lime text-black"
                                  : "bg-surface-high text-on-surface-variant border border-outline hover:border-lime"
                              }`}
                            >
                              {isSelected ? "Added ✓" : "Add"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Smoking Fee Notice */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-400">* Smoking Fee is $200.00</p>
                  <p className="text-xs text-on-surface-variant mt-1">Additional charge if smoking occurs in the vehicle</p>
                </div>

                {/* Selected Add-ons Summary */}
                {selectedAddOns.length > 0 && (
                  <div className="bg-surface-mid rounded-lg p-4">
                    <p className="text-sm text-on-surface-variant mb-3">Selected Add-ons:</p>
                    <div className="space-y-2">
                      {selectedAddOns.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-on-surface">{item.name}</span>
                          <span className="text-lime">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-outline/30 text-sm">
                        <span className="text-on-surface-variant">Add-ons Total</span>
                        <span className="text-lime font-bold">
                          ${selectedAddOns.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => handleFormChange("customerName", e.target.value)}
                        placeholder="John Smith"
                        className="w-full bg-surface-mid border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleFormChange("customerEmail", e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-surface-mid border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => handleFormChange("customerPhone", e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full bg-surface-mid border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface-variant mb-2">Special Requests</label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) => handleFormChange("specialRequests", e.target.value)}
                        placeholder="Any special requirements..."
                        rows={3}
                        className="w-full bg-surface-mid border-b border-outline px-4 py-3 text-on-surface focus:border-lime focus:outline-none resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="bg-surface-mid rounded-xl p-6">
                      <h4 className="text-lg font-bold text-primary mb-4">Booking Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Vehicle</span>
                          <span className="text-on-surface">{selectedVehicleData?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Pickup Location</span>
                          <span className="text-on-surface">{pickupLocation}</span>
                        </div>
                        {serviceType === "destination" && (
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">Dropoff</span>
                            <span className="text-on-surface">{dropoffLocation}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Date & Time</span>
                          <span className="text-on-surface">{selectedDate} @ {selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Service</span>
                          <span className="text-on-surface">
                            {serviceType === "hourly" 
                              ? `${selectedHours} Hour${selectedHours > 1 ? "s" : ""}` 
                              : "Destination"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Service Area</span>
                          <span className="text-on-surface">{serviceAreas.find(a => a.code === selectedArea)?.name}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-outline/30">
                          <span className="text-on-surface-variant">Base Total</span>
                          <span className="text-on-surface">${calculatePrice()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Fuel Fee (10%)</span>
                          <span className="text-on-surface">${calculateTotalWithFees().fuelFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Tax (6%)</span>
                          <span className="text-on-surface">${calculateTotalWithFees().tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Gratuity</span>
                          <span className="text-on-surface">${calculateTotalWithFees().gratuity}</span>
                        </div>
                        {selectedAddOns.length > 0 && (
                          <>
                            <div className="flex justify-between pt-3 border-t border-outline/30">
                              <span className="text-on-surface-variant">Add-ons</span>
                              <span className="text-lime">${calculateTotalWithFees().addOnsTotal.toFixed(2)}</span>
                            </div>
                            {selectedAddOns.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">{item.name}</span>
                                <span className="text-on-surface">${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Contact</span>
                          <span className="text-on-surface">{formData.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Email</span>
                          <span className="text-on-surface">{formData.customerEmail}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-outline/30">
                          <span className="text-lime font-bold">Total</span>
                          <span className="text-lime font-bold text-xl">${calculateTotalWithFees().total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {submitStatus === "error" && (
                      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
                        <p className="text-red-400">Something went wrong. Please try again.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="bg-surface-mid rounded-xl p-6 text-center">
                      <p className="text-on-surface-variant mb-2">Amount Due</p>
                      <p className="text-5xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                        ${calculateTotalWithFees().total.toFixed(2)}
                      </p>
                      <p className="text-sm text-on-surface-variant mt-2">
                        {selectedVehicleData?.name} • {serviceType === "hourly" ? `${selectedHours} Hours` : "Destination"}
                      </p>
                    </div>

                    <div className="bg-surface-high rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Base Total</span>
                        <span className="text-on-surface">${calculateTotalWithFees().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Fuel Fee (10%)</span>
                        <span className="text-on-surface">${calculateTotalWithFees().fuelFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Tax (6%)</span>
                        <span className="text-on-surface">${calculateTotalWithFees().tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Gratuity</span>
                        <span className="text-on-surface">${calculateTotalWithFees().gratuity}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 1111 1111 1111"
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                          onChange={(e) => setCardNonce(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-on-surface-variant mb-2">Expiry</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-on-surface-variant mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-on-surface-variant mb-2">ZIP Code</label>
                        <input
                          type="text"
                          placeholder="12345"
                          className="w-full bg-surface-mid border border-outline rounded-lg px-4 py-3 text-on-surface focus:border-lime focus:outline-none"
                        />
                      </div>
                    </div>

                    {cardErrors && (
                      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
                        <p className="text-red-400">{cardErrors}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>

          {submitStatus !== "success" && (
            <div className="sticky bottom-0 bg-surface-high p-6 border-t border-outline/30">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {currentStep === 1 ? "Cancel" : "Back"}
                </button>

                {currentStep < 5 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={
                      (currentStep === 1 && (!selectedVehicle || !selectedDate || !pickupLocation || (serviceType === "destination" && !dropoffLocation))) ||
                      (currentStep === 3 && (!formData.customerName || !formData.customerEmail || !formData.customerPhone))
                    }
                    className="btn-lime px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={currentStep === 5 ? processPayment : handleSubmit}
                    disabled={isSubmitting}
                    className="btn-lime px-8 py-3 disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : currentStep === 5 ? `Pay $${calculateTotalWithFees().total.toFixed(2)}` : "Confirm Booking"}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}