"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { FleetVehicle } from "@/lib/limo";
import {
  SERVICE_AREAS,
  calculateBookingTotals,
  formatCurrency,
} from "@/lib/limo";
import SquarePaymentForm from "./SquarePaymentForm";

type Step = 1 | 2 | 3 | 4 | 5;

type BookingStatus = "idle" | "creating_booking" | "ready_for_payment" | "payment_complete" | "error";

type BookingApiResponse = {
  success: boolean;
  booking: {
    id: string;
    square_customer_id: string | null;
  };
  message?: string;
};

const addOns = [
  { id: "red-carpet", name: "10ft Red Carpet", price: 45, category: "service" },
  { id: "beer", name: "Beer", price: 30, category: "alcohol" },
  { id: "liquor", name: "Liquor", price: 60, category: "alcohol" },
  { id: "wine", name: "Wine", price: 25, category: "alcohol" },
  { id: "champagne", name: "Champagne", price: 80, category: "alcohol" },
  { id: "snacks", name: "Snacks & Chips", price: 10, category: "food" },
  { id: "flowers", name: "Flowers", price: 25, category: "service" },
  { id: "balloons", name: "Balloons", price: 10, category: "service" },
];

const steps: Array<{ id: Step; label: string }> = [
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
  vehicles: FleetVehicle[];
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedVehicleId,
  vehicles,
}: BookingModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const createBookingRequestRef = useRef<Promise<void> | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(selectedVehicleId);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [selectedHours, setSelectedHours] = useState(4);
  const [serviceType, setServiceType] = useState<"hourly" | "point_to_point">("hourly");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [selectedArea, setSelectedArea] = useState("MD");
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
  });
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");
  const [bookingError, setBookingError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [squareCustomerId, setSquareCustomerId] = useState<string | null>(null);
  const [paymentIdempotencyKey, setPaymentIdempotencyKey] = useState<string | null>(null);

  const selectedVehicleData = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicle) ?? null,
    [selectedVehicle, vehicles]
  );

  const totals = calculateBookingTotals(
    selectedVehicleData,
    serviceType,
    selectedArea,
    selectedHours,
    selectedAddOns.reduce((sum, item) => sum + item.price, 0)
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSelectedVehicle(selectedVehicleId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen, selectedVehicleId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const minHours = selectedVehicleData?.min_hours ?? 4;
    const timer = window.setTimeout(() => {
      setSelectedHours((current) => Math.max(current, minHours));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen, selectedVehicleData]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const getMonthData = (offset: number) => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const monthName = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const firstDay = monthStart.getDay();
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i += 1) {
      days.push({ day: "", empty: true });
    }

    for (let i = 1; i <= daysInMonth; i += 1) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), i);
      days.push({
        day: i,
        date: date.toISOString().split("T")[0],
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
      });
    }

    return { monthName, days };
  };

  const currentMonth = getMonthData(currentMonthOffset);
  const times = Array.from({ length: 24 }, (_, index) => `${index.toString().padStart(2, "0")}:00`);

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const toggleAddOn = (id: string) => {
    const item = addOns.find((addOn) => addOn.id === id);
    if (!item) {
      return;
    }

    setSelectedAddOns((current) => {
      const exists = current.some((selected) => selected.id === id);
      if (exists) {
        return current.filter((selected) => selected.id !== id);
      }

      return [...current, { id: item.id, name: item.name, price: item.price }];
    });
  };

  const buildSpecialRequests = () => {
    const addOnSummary =
      selectedAddOns.length > 0
        ? `Add-ons: ${selectedAddOns.map((item) => item.name).join(", ")}`
        : "";

    return [formData.specialRequests.trim(), addOnSummary].filter(Boolean).join("\n");
  };

  const createBooking = () => {
    if (createdBookingId) {
      setBookingStatus("ready_for_payment");
      setCurrentStep(5);
      return;
    }

    if (createBookingRequestRef.current) {
      return;
    }

    if (!selectedVehicle || !selectedDate || !pickupLocation || !formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      return;
    }

    setBookingStatus("creating_booking");
    setBookingError("");

    const request = (async () => {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          date: selectedDate,
          time: selectedTime,
          hours: selectedHours,
          serviceType,
          serviceArea: selectedArea,
          pickupLocation,
          dropoffLocation: serviceType === "point_to_point" ? dropoffLocation : "",
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          specialRequests: buildSpecialRequests(),
        }),
      });

      const data = (await response.json()) as BookingApiResponse | { error?: string };
      if (!response.ok || !("success" in data) || !data.success) {
        throw new Error("error" in data ? data.error || "Failed to create booking." : "Failed to create booking.");
      }

      setCreatedBookingId(data.booking.id);
      setSquareCustomerId(data.booking.square_customer_id);
      setPaymentIdempotencyKey(crypto.randomUUID());
      setBookingStatus("ready_for_payment");
      setCurrentStep(5);
    })();

    createBookingRequestRef.current = request;

    void request.catch((error) => {
      const message = error instanceof Error ? error.message : "Failed to create booking.";
      setBookingStatus("error");
      setBookingError(message);
    }).finally(() => {
      createBookingRequestRef.current = null;
    });
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setCurrentMonthOffset(0);
    setSelectedDate(null);
    setSelectedTime("10:00");
    setSelectedHours(4);
    setServiceType("hourly");
    setPickupLocation("");
    setDropoffLocation("");
    setSelectedArea("MD");
    setSelectedAddOns([]);
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      specialRequests: "",
    });
    setBookingStatus("idle");
    setBookingError("");
    setPaymentError("");
    setCreatedBookingId(null);
    setSquareCustomerId(null);
    setPaymentIdempotencyKey(null);
    onClose();
  };

  const handleStepNavigation = (step: Step) => {
    if (bookingStatus === "payment_complete") {
      return;
    }

    if (step === 5 && !createdBookingId) {
      setBookingError("Create the booking before continuing to payment.");
      setCurrentStep(4);
      return;
    }

    setCurrentStep(step);
  };

  const handlePaymentSuccess = useCallback(() => {
    setPaymentError("");
    setBookingStatus("payment_complete");
  }, []);

  const handlePaymentError = useCallback((error: string) => {
    setPaymentError(error);
  }, []);

  const canContinueFromStepOne =
    !!selectedVehicle &&
    !!selectedDate &&
    !!pickupLocation.trim() &&
    (serviceType === "hourly" || !!dropoffLocation.trim());

  const canContinueFromStepThree =
    !!formData.customerName.trim() &&
    !!formData.customerEmail.trim() &&
    !!formData.customerPhone.trim();

  const showFooter = currentStep < 5 && bookingStatus !== "payment_complete";

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={resetAndClose}
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-surface-high ghost-border"
          style={{ overscrollBehavior: "contain" }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-surface-high">
            <div className="flex items-center justify-between border-b border-outline/30 p-6">
              <div>
                <p id={descriptionId} className="text-xs uppercase tracking-widest text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                  Reservation Protocol
                </p>
                <h2 id={titleId} className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  Book Now
                </h2>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="flex h-10 w-10 items-center justify-center text-on-surface-variant transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                aria-label="Close booking modal"
              >
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 border-b border-outline/20 p-4">
              {steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepNavigation(step.id)}
                  disabled={step.id === 5 && !createdBookingId}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
                    currentStep === step.id
                      ? "bg-lime font-bold text-black"
                      : step.id < currentStep
                        ? "bg-lime/20 text-lime"
                        : "text-on-surface-variant"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-xs">
                    {step.id < currentStep ? "✓" : step.id}
                  </span>
                  <span className="hidden text-xs uppercase sm:inline">{step.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[400px] p-6">
            {bookingStatus === "payment_complete" ? (
              <motion.div initial={prefersReducedMotion ? false : { opacity: 0 }} animate={prefersReducedMotion ? undefined : { opacity: 1 }} className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lime">
                  <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="mb-4 text-3xl font-bold text-lime" style={{ fontFamily: "var(--font-display)" }}>
                  Reservation Confirmed
                </h3>
                <p className="mb-8 text-on-surface-variant">
                  Payment was processed successfully for {formData.customerEmail}.
                </p>
                <button type="button" onClick={resetAndClose} className="btn-lime px-8 py-3">
                  Done
                </button>
              </motion.div>
            ) : (
              <>
                {currentStep === 1 && (
                  <motion.div initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }} className="space-y-6">
                    <div>
                      <label className="mb-3 block text-sm text-on-surface-variant">Select Vehicle *</label>
                      {serviceType === "point_to_point" && (
                        <p className="mb-2 text-xs text-lime">Point-to-point pricing uses the selected vehicle&apos;s base rate plus area fee.</p>
                      )}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {vehicles.map((vehicle) => (
                          <button
                            key={vehicle.id}
                            type="button"
                            onClick={() => setSelectedVehicle(vehicle.id)}
                            className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
                              selectedVehicle === vehicle.id
                                ? "border-lime bg-lime/10"
                                : "border-outline hover:border-on-surface-variant"
                            }`}
                          >
                            <p className="text-sm font-semibold text-on-surface">{vehicle.name}</p>
                            <p className="text-xs text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                              {formatCurrency(vehicle.hourly_rate_local)}/hr
                              {vehicle.min_hours > 1 && ` (${vehicle.min_hours}hr min)`}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm text-on-surface-variant">Service Type *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setServiceType("hourly")}
                          className={`rounded-lg border p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
                            serviceType === "hourly"
                              ? "border-lime bg-lime/10"
                              : "border-outline hover:border-on-surface-variant"
                          }`}
                        >
                          <p className="font-semibold text-on-surface">Hourly Service</p>
                          <p className="text-xs text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                            4-hour bundle available
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceType("point_to_point")}
                          className={`rounded-lg border p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
                            serviceType === "point_to_point"
                              ? "border-lime bg-lime/10"
                              : "border-outline hover:border-on-surface-variant"
                          }`}
                        >
                          <p className="font-semibold text-on-surface">Point to Point</p>
                          <p className="text-xs text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                            Base rate plus area fee
                          </p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pickup-location" className="mb-2 block text-sm text-on-surface-variant">
                        Pickup Location *
                      </label>
                      <input
                        id="pickup-location"
                        ref={firstFieldRef}
                        name="pickupLocation"
                        type="text"
                        autoComplete="street-address"
                        value={pickupLocation}
                        onChange={(event) => setPickupLocation(event.target.value)}
                        placeholder="123 Main St, City, State…"
                        className="w-full rounded-lg border border-outline bg-surface-mid px-4 py-3 text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                      />
                    </div>

                    {serviceType === "point_to_point" && (
                      <div>
                        <label htmlFor="dropoff-location" className="mb-2 block text-sm text-on-surface-variant">
                          Dropoff Location *
                        </label>
                        <input
                          id="dropoff-location"
                          name="dropoffLocation"
                          type="text"
                          autoComplete="off"
                          value={dropoffLocation}
                          onChange={(event) => setDropoffLocation(event.target.value)}
                          placeholder="456 Destination, City, State…"
                          className="w-full rounded-lg border border-outline bg-surface-mid px-4 py-3 text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                        />
                      </div>
                    )}

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <label className="text-sm text-on-surface-variant">Select Date *</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentMonthOffset(Math.max(0, currentMonthOffset - 1))}
                            disabled={currentMonthOffset === 0}
                            className="p-2 text-on-surface-variant transition-colors hover:text-lime disabled:opacity-30"
                          >
                            ← Prev
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentMonthOffset(currentMonthOffset + 1)}
                            disabled={currentMonthOffset >= 2}
                            className="p-2 text-on-surface-variant transition-colors hover:text-lime disabled:opacity-30"
                          >
                            Next →
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg bg-surface-mid p-4">
                        <p className="mb-3 text-center font-bold text-lime">{currentMonth.monthName}</p>
                        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                            <span key={day} className="text-xs text-on-surface-variant">
                              {day}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {currentMonth.days.map((day, index) => (
                            <button
                              key={`${day.date ?? "empty"}-${index}`}
                              type="button"
                              disabled={day.empty || day.isPast}
                              onClick={() => day.date && setSelectedDate(day.date)}
                              className={`h-10 w-10 rounded text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
                                day.empty
                                  ? "invisible"
                                  : selectedDate === day.date
                                    ? "bg-lime font-bold text-black"
                                    : day.isPast
                                      ? "cursor-not-allowed text-outline/40"
                                      : "hover:bg-surface-highest hover:text-lime"
                              }`}
                            >
                              {day.day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pickup-time" className="mb-2 block text-sm text-on-surface-variant">
                          Pickup Time
                        </label>
                        <select
                          id="pickup-time"
                          name="pickupTime"
                          value={selectedTime}
                          onChange={(event) => setSelectedTime(event.target.value)}
                          className="w-full rounded-lg border border-outline bg-surface-mid px-4 py-3 text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                        >
                          {times.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="service-area" className="mb-2 block text-sm text-on-surface-variant">
                          Service Area
                        </label>
                        <select
                          id="service-area"
                          name="serviceArea"
                          value={selectedArea}
                          onChange={(event) => setSelectedArea(event.target.value)}
                          className="w-full rounded-lg border border-outline bg-surface-mid px-4 py-3 text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                        >
                          {SERVICE_AREAS.map((area) => (
                            <option key={area.code} value={area.code}>
                              {area.name} {area.baseFee > 0 ? `(+${formatCurrency(area.baseFee)})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {serviceType === "hourly" && (
                      <div>
                        <label className="mb-3 block text-sm text-on-surface-variant">Duration *</label>
                        {selectedVehicleData?.min_hours && selectedVehicleData.min_hours > 1 && (
                          <p className="mb-2 text-xs text-lime">
                            {selectedVehicleData.name} requires a {selectedVehicleData.min_hours}-hour minimum.
                          </p>
                        )}
                        <div className="mb-2 flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => {
                            const isDisabled = selectedVehicleData ? hours < selectedVehicleData.min_hours : false;
                            return (
                              <button
                                key={hours}
                                type="button"
                                onClick={() => {
                                  if (!isDisabled) {
                                    setSelectedHours(hours);
                                  }
                                }}
                                disabled={isDisabled}
                                className={`rounded-lg border px-4 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
                                  isDisabled
                                    ? "cursor-not-allowed border-outline/30 text-outline/30"
                                    : selectedHours === hours
                                      ? "border-lime bg-lime/10"
                                      : "border-outline hover:border-lime"
                                }`}
                              >
                                <span className="text-on-surface">
                                  {hours} hr{hours > 1 ? "s" : ""}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          Estimated base total: {formatCurrency(totals.basePrice)}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }} className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-primary">Ride Extras</h3>
                      <p className="text-sm text-on-surface-variant">Select add-ons for the limo experience.</p>
                    </div>

                    {[
                      { title: "Service", ids: ["red-carpet", "flowers", "balloons"] },
                      { title: "Alcohol", ids: ["beer", "liquor", "wine", "champagne"] },
                      { title: "Food", ids: ["snacks"] },
                    ].map((group) => (
                      <div key={group.title} className="overflow-hidden rounded-lg bg-surface-mid">
                        <div className="bg-surface-high px-4 py-3">
                          <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">{group.title}</p>
                        </div>
                        {group.ids.map((id) => {
                          const item = addOns.find((addOn) => addOn.id === id)!;
                          const isSelected = selectedAddOns.some((selected) => selected.id === item.id);

                          return (
                            <div key={item.id} className="flex items-center justify-between border-t border-outline/20 px-4 py-3">
                              <span className="text-on-surface">{item.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="w-16 text-right font-bold text-lime">{formatCurrency(item.price)}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleAddOn(item.id)}
                                  className={`min-w-[88px] rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${
                                    isSelected
                                      ? "bg-lime text-black"
                                      : "border border-outline bg-surface-high text-on-surface-variant hover:border-lime"
                                  }`}
                                >
                                  {isSelected ? "Added ✓" : "Add"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {selectedAddOns.length > 0 && (
                      <div className="rounded-lg bg-surface-mid p-4">
                        <p className="mb-3 text-sm text-on-surface-variant">Selected add-ons</p>
                        <div className="space-y-2">
                          {selectedAddOns.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-on-surface">{item.name}</span>
                              <span className="text-lime">{formatCurrency(item.price)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between border-t border-outline/30 pt-2 text-sm">
                            <span className="text-on-surface-variant">Add-ons Total</span>
                            <span className="font-bold text-lime">{formatCurrency(totals.addOnsTotal)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label htmlFor="customer-name" className="mb-2 block text-sm text-on-surface-variant">
                        Full Name *
                      </label>
                      <input
                        id="customer-name"
                        ref={firstFieldRef}
                        name="customerName"
                        type="text"
                        autoComplete="name"
                        value={formData.customerName}
                        onChange={(event) => handleFormChange("customerName", event.target.value)}
                        placeholder="John Smith…"
                        className="w-full border-b border-outline bg-surface-mid px-4 py-3 text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                      />
                    </div>
                    <div>
                      <label htmlFor="customer-email" className="mb-2 block text-sm text-on-surface-variant">
                        Email *
                      </label>
                      <input
                        id="customer-email"
                        name="customerEmail"
                        type="email"
                        autoComplete="email"
                        spellCheck={false}
                        value={formData.customerEmail}
                        onChange={(event) => handleFormChange("customerEmail", event.target.value)}
                        placeholder="john@example.com…"
                        className="w-full border-b border-outline bg-surface-mid px-4 py-3 text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                      />
                    </div>
                    <div>
                      <label htmlFor="customer-phone" className="mb-2 block text-sm text-on-surface-variant">
                        Phone *
                      </label>
                      <input
                        id="customer-phone"
                        name="customerPhone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={formData.customerPhone}
                        onChange={(event) => handleFormChange("customerPhone", event.target.value)}
                        placeholder="(555) 123-4567…"
                        className="w-full border-b border-outline bg-surface-mid px-4 py-3 text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                      />
                    </div>
                    <div>
                      <label htmlFor="special-requests" className="mb-2 block text-sm text-on-surface-variant">
                        Special Requests
                      </label>
                      <textarea
                        id="special-requests"
                        name="specialRequests"
                        rows={3}
                        autoComplete="off"
                        value={formData.specialRequests}
                        onChange={(event) => handleFormChange("specialRequests", event.target.value)}
                        placeholder="Any special requirements…"
                        className="w-full resize-none border-b border-outline bg-surface-mid px-4 py-3 text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }} className="space-y-6">
                    <div className="rounded-xl bg-surface-mid p-6">
                      <h3 className="mb-4 text-lg font-bold text-primary">Booking Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Vehicle</span>
                          <span className="text-on-surface">{selectedVehicleData?.name}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-on-surface-variant">Pickup Location</span>
                          <span className="text-right text-on-surface">{pickupLocation}</span>
                        </div>
                        {serviceType === "point_to_point" && (
                          <div className="flex justify-between gap-4">
                            <span className="text-on-surface-variant">Dropoff</span>
                            <span className="text-right text-on-surface">{dropoffLocation}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Date &amp; Time</span>
                          <span className="text-on-surface">
                            {selectedDate} @ {selectedTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Service</span>
                          <span className="text-on-surface">
                            {serviceType === "hourly" ? `${selectedHours} Hour${selectedHours > 1 ? "s" : ""}` : "Point to Point"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Service Area</span>
                          <span className="text-on-surface">{SERVICE_AREAS.find((area) => area.code === selectedArea)?.name}</span>
                        </div>
                        <div className="flex justify-between border-t border-outline/30 pt-3">
                          <span className="text-on-surface-variant">Base Total</span>
                          <span className="text-on-surface">{formatCurrency(totals.basePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Fuel Fee (10%)</span>
                          <span className="text-on-surface">{formatCurrency(totals.fuelFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Tax (6%)</span>
                          <span className="text-on-surface">{formatCurrency(totals.tax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Gratuity</span>
                          <span className="text-on-surface">{formatCurrency(totals.gratuity)}</span>
                        </div>
                        {selectedAddOns.length > 0 && (
                          <>
                            <div className="flex justify-between border-t border-outline/30 pt-3">
                              <span className="text-on-surface-variant">Add-ons</span>
                              <span className="text-lime">{formatCurrency(totals.addOnsTotal)}</span>
                            </div>
                            {selectedAddOns.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-on-surface-variant">{item.name}</span>
                                <span className="text-on-surface">{formatCurrency(item.price)}</span>
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
                        <div className="flex justify-between border-t border-outline/30 pt-3">
                          <span className="font-bold text-lime">Total</span>
                          <span className="text-xl font-bold text-lime">{formatCurrency(totals.total)}</span>
                        </div>
                      </div>
                    </div>

                    {bookingError && (
                      <div className="rounded-lg border border-red-500 bg-red-500/20 p-4 text-center">
                        <p className="text-red-300">{bookingError}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 5 && createdBookingId && paymentIdempotencyKey && (
                  <motion.div initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }} className="space-y-6">
                    <div className="rounded-xl bg-surface-mid p-6 text-center">
                      <p className="mb-2 text-on-surface-variant">Amount Due</p>
                      <p className="text-5xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                        {formatCurrency(totals.total)}
                      </p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {selectedVehicleData?.name} • {serviceType === "hourly" ? `${selectedHours} Hours` : "Point to Point"}
                      </p>
                    </div>

                    <SquarePaymentForm
                      amount={totals.total}
                      customerId={squareCustomerId ?? undefined}
                      bookingId={createdBookingId}
                      idempotencyKey={paymentIdempotencyKey}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />

                    {paymentError && (
                      <div className="rounded-lg border border-red-500 bg-red-500/20 p-4 text-center" aria-live="polite">
                        <p className="text-red-300">{paymentError}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>

          {showFooter && (
            <div className="sticky bottom-0 border-t border-outline/30 bg-surface-high p-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1) {
                      resetAndClose();
                      return;
                    }

                    setCurrentStep((current) => Math.max(1, current - 1) as Step);
                  }}
                  className="px-6 py-3 text-on-surface-variant transition-colors hover:text-primary"
                >
                  {currentStep === 1 ? "Cancel" : "Back"}
                </button>

                {currentStep < 4 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((current) => (current + 1) as Step)}
                    disabled={(currentStep === 1 && !canContinueFromStepOne) || (currentStep === 3 && !canContinueFromStepThree)}
                    className="btn-lime px-8 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                )}

                {currentStep === 4 && (
                  <button
                    type="button"
                    onClick={createBooking}
                    disabled={bookingStatus === "creating_booking"}
                    className="btn-lime px-8 py-3 disabled:opacity-50"
                  >
                    {bookingStatus === "creating_booking" ? "Creating Booking…" : "Continue to Payment"}
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
