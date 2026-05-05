"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { FleetVehicle } from "@/lib/limo";
import { VEHICLE_TYPE_LABELS, formatCurrency } from "@/lib/limo";

interface FleetShowcaseProps {
  vehicles: FleetVehicle[];
  onVehicleSelect?: (vehicleId: string) => void;
}

export default function FleetShowcase({ vehicles, onVehicleSelect }: FleetShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="fleet" className="scroll-mt-24 px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="mb-4 text-xs uppercase tracking-widest text-lime" style={{ fontFamily: "var(--font-mono)" }}>
            Fleet Overview
          </p>
          <h2 className="text-display text-4xl text-primary md:text-5xl text-balance">Our Fleet</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle, index) => (
            <motion.article
              key={vehicle.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : index * 0.06 }}
              className="group overflow-hidden rounded-xl bg-surface-mid card-surface"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={vehicle.image_url || "/ufirst-logo.png"}
                  alt={vehicle.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-mid via-transparent to-transparent" />

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-lime animate-pulse" />
                  <span className="text-xs uppercase tracking-wider text-white" style={{ fontFamily: "var(--font-mono)" }}>
                    Available
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="mb-1 text-xs uppercase tracking-wider text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                      {VEHICLE_TYPE_LABELS[vehicle.type]}
                    </p>
                    <h3 className="text-display text-xl text-primary">{vehicle.name}</h3>
                    {vehicle.min_hours > 1 && (
                      <p className="mt-1 text-xs text-lime">{vehicle.min_hours}-hour minimum</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant">Starting at</p>
                    <p className="text-xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                      {formatCurrency(vehicle.hourly_rate_local)}
                      <span className="text-sm text-on-surface-variant">/hr</span>
                    </p>
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    <span className="text-sm text-on-surface">{vehicle.capacity} Passengers</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                    <span className="text-sm text-on-surface">{vehicle.luggage_capacity} Luggage</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onVehicleSelect?.(vehicle.id)}
                  className="btn-lime w-full py-3 text-sm uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                >
                  Select Vehicle
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
