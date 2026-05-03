"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "20+", label: "Years Experience" },
  { value: "MD", label: "Primary Market" },
  { value: "East Coast", label: "Installation Reach" },
];

const categories = [
  { name: "Entertainment Venues", icon: "🎭" },
  { name: "Corporations", icon: "🏢" },
  { name: "Churches", icon: "⛪" },
];

export default function KJSocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} style={{ background: "#0b1326", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Stats Column */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="kj-label mb-4">[ Social Proof ]</p>
            <h2
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "#dae2fd",
                marginBottom: "2rem",
              }}
            >
              Trusted by Industry Professionals <span style={{ color: "#ffe083" }}>Across the Region.</span>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-left">
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.75rem",
                      color: "#d0bcff",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#958ea0",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Categories Column */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 gap-4"
          >
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className="kj-glass-card flex items-center gap-6"
                style={{ padding: "1.5rem 2rem" }}
              >
                <span style={{ fontSize: "2rem" }}>{cat.icon}</span>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#dae2fd",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {cat.name}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
