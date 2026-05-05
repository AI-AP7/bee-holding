"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function KJAbout() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} style={{ background: "#0b1326", padding: "7rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="kj-label mb-4">[ Who We Are ]</p>
            <h2
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#dae2fd",
                marginBottom: "1.5rem",
              }}
            >
              Two Decades.
              <br />
              <span style={{ color: "#d0bcff" }}>One Standard of Excellence.</span>
            </h2>
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "#958ea0",
              }}
            >
              K&amp;J Sound Company has spent over two decades setting the standard for professional event production and AV installation across Maryland and the East Coast. We&apos;re not a rental house — we&apos;re a production partner. From intimate celebrations to large-scale corporate productions, every engagement receives the same meticulous attention to acoustics, lighting design, and technical execution.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/3] rounded-lg overflow-hidden"
          >
            <Image
              src="/K&J-board.jpeg"
              alt="K & J Sound Company"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
