"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  type: string;
  capacity: number;
  luggage_capacity: number;
  hourly_rate_local: number;
  image_url: string;
  features: string[];
}

export default function FleetShowcase() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, name, slug, type, capacity, luggage_capacity, hourly_rate_local, image_url, features")
        .eq("is_active", true)
        .order("display_order");

      if (data) setVehicles(data);
      setLoading(false);
    }

    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <section id="fleet" className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-on-surface-variant">Loading fleet...</div>
        </div>
      </section>
    );
  }

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
          {vehicles.map((vehicle, index) => (
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
                      {vehicle.type === "stretch_limo" ? "Stretch Limo" : vehicle.type === "suv" ? "SUV" : "Sedan"}
                    </p>
                    <h3 className="text-display text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
                      {vehicle.name}
                    </h3>
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

                <button className="w-full btn-ghost py-3 text-sm uppercase tracking-wider">
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