"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface FleetVehicle {
  id: string;
  name: string;
  slug: string;
  type: string;
  capacity: number;
  luggage_capacity: number;
  hourly_rate_local: number;
  min_hours: number;
  image_url: string;
  features: string[];
}

const FLEET_DATA: FleetVehicle[] = [
  {
    id: "1",
    name: "Black Stretch Limo",
    slug: "black-stretch-limo",
    type: "stretch_limo",
    capacity: 8,
    luggage_capacity: 4,
    hourly_rate_local: 140,
    min_hours: 1,
    image_url: "/black_stretch.jpg",
    features: ["Leather interior", "Privacy partition", "Champagne bar", "Premium sound system", "LED mood lighting", "Tinted windows"],
  },
  {
    id: "2",
    name: "White Stretch Limo",
    slug: "white-stretch-limo",
    type: "stretch_limo",
    capacity: 12,
    luggage_capacity: 4,
    hourly_rate_local: 160,
    min_hours: 4,
    image_url: "/white_stretch.webp",
    features: ["Leather interior", "Privacy partition", "Champagne bar", "Premium sound system", "Fiber optic lighting", "Tinted windows"],
  },
  {
    id: "3",
    name: "Escalade",
    slug: "escalade-esv",
    type: "suv",
    capacity: 6,
    luggage_capacity: 6,
    hourly_rate_local: 170,
    min_hours: 4,
    image_url: "/cadilac_esv.jpg",
    features: ["Plush leather seats", "Third row seating", "Entertainment system", "Extra luggage space", "Climate control", "WiFi hotspot"],
  },
  {
    id: "4",
    name: "Mercedes S-Class",
    slug: "mercedes-s-class",
    type: "sedan",
    capacity: 4,
    luggage_capacity: 3,
    hourly_rate_local: 160,
    min_hours: 4,
    image_url: "/s-class.webp",
    features: ["Executive leather interior", "Massage seats", "Premium sound system", "Privacy glass", "Climate control", "USB charging"],
  },
  {
    id: "5",
    name: "Party Bus",
    slug: "party-bus",
    type: "party_bus",
    capacity: 20,
    luggage_capacity: 10,
    hourly_rate_local: 230,
    min_hours: 4,
    image_url: "/party-bus.jpg",
    features: ["Premium sound system", "LED mood lighting", "Dance floor", "Privacy partition", "Bar area", "Climate control", "Entertainment system"],
  },
];

interface FleetShowcaseProps {
  onVehicleSelect?: (vehicleId: string) => void;
}

export default function FleetShowcase({ onVehicleSelect }: FleetShowcaseProps) {
  return (
    <section id="fleet" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-lime text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-mono)" }}>
            Fleet Overview
          </p>
          <h2 className="text-display text-4xl md:text-5xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
            OUR FLEET
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FLEET_DATA.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-surface-mid rounded-xl overflow-hidden card-surface"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={vehicle.image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"}
                  alt={vehicle.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-mid via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                  <span className="text-xs uppercase tracking-wider text-white" style={{ fontFamily: "var(--font-mono)" }}>
                    Available
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-lime mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                      {vehicle.type === "stretch_limo" ? "Stretch Limo" : vehicle.type === "suv" ? "SUV" : vehicle.type === "party_bus" ? "Party Bus" : "Sedan"}
                    </p>
                    <h3 className="text-display text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
                      {vehicle.name}
                    </h3>
                    {vehicle.min_hours > 1 && (
                      <p className="text-xs text-lime mt-1">{vehicle.min_hours}-hour minimum</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant">Starting at</p>
                    <p className="text-xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                      ${vehicle.hourly_rate_local}<span className="text-sm text-on-surface-variant">/hr</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    <span className="text-sm text-on-surface">{vehicle.capacity} Passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                    <span className="text-sm text-on-surface">{vehicle.luggage_capacity} Luggage</span>
                  </div>
                </div>

                <button 
                  onClick={() => onVehicleSelect?.(vehicle.id)}
                  className="w-full btn-lime py-3 text-sm uppercase tracking-wider"
                >
                  Select Vehicle
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
