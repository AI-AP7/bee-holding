import { FleetShowcase, ReviewsSection, BookingSection } from "@/components/limo";
import Link from "next/link";
import { Metadata } from "next";
import { localBusinessSchema, serviceSchema, faqSchema } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "UFirst Limos | Premium Limousine Service MD, DC, VA, PA",
  description:
    "Book premium limousine service in Maryland, DC, Virginia & Pennsylvania. Black stretch limos, Escalades & Mercedes S-Class. Hourly or point-to-point. 5-star rated.",
  alternates: {
    canonical: "https://blkexcellenceenterprise.com/limo",
  },
  openGraph: {
    title: "UFirst Limos | Premium Transportation",
    description: "Maryland, DC, Virginia, Pennsylvania's premier limousine service",
    url: "https://blkexcellenceenterprise.com/limo",
    siteName: "UFirst Limos",
    type: "website",
  },
};

export default function LimoPage() {
  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      </head>
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          </div>

          {/* Tactical Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(rgba(189, 219, 55, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(189, 219, 55, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />

          <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-32">
            {/* Tier Tag */}
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-lime rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                Premier Tier Service
              </span>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* Parent Company Link */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                    BLACK EXCELLENCE ENTERPRISES
                  </span>
                </Link>

                <h1
                  className="text-display leading-none mb-6"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(3rem, 8vw, 6rem)",
                    fontWeight: 800,
                  }}
                >
                  <span className="text-primary">UFIRST</span>
                  <br />
                  <span className="text-lime">LIMOS</span>
                </h1>

                <p className="text-lg text-on-surface-variant max-w-lg mb-8">
                  Private, clinical, and absolute transit protocols engaged. 
                  Experience luxury transportation across Maryland, DC, Virginia, and Pennsylvania.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <a href="#booking" className="btn-lime px-8 py-4">
                    Reserve Now
                  </a>
                  <a href="#fleet" className="btn-ghost px-8 py-4">
                    View Fleet
                  </a>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="hidden lg:block">
                <div className="bg-surface-high/80 backdrop-blur-sm rounded-2xl p-8 ghost-border">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-outline/30">
                    <span className="w-3 h-3 rounded-full bg-lime animate-pulse" />
                    <span className="text-xs uppercase tracking-widest text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                      Live Fleet Status
                    </span>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                        Operational Hub
                      </p>
                      <p className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                        BEE-HQ-01
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                        Units Available
                      </p>
                      <p className="text-3xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                        05 / 05
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                        Response Time
                      </p>
                      <p className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                        ~15 min
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <nav className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-outline/20">
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
              <div className="flex items-center justify-center gap-1 h-14">
                {["Experience", "Fleet", "Reservation", "Reviews"].map((item, index) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                      index === 1
                        ? "bg-lime text-black font-bold"
                        : "text-white hover:text-lime"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-24 px-6 md:px-12 lg:px-24 bg-surface-low">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lime text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-mono)" }}>
                  The Experience
                </p>
                <h2 className="text-display text-4xl md:text-5xl text-primary mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  PREMIUM SERVICE,<br />
                  <span className="text-lime">EVERY MILE</span>
                </h2>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  From the moment you book to your final destination, UFirst Limos delivers an unparalleled 
                  experience. Our fleet of premium vehicles and professional chauffeurs ensure you arrive 
                  in style, comfort, and on time.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Service Areas", value: "4 States" },
                    { label: "Fleet Vehicles", value: "5+" },
                    { label: "On-Time Rate", value: "99%" },
                    { label: "Customer Rating", value: "5.0" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-surface-mid rounded-lg">
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80"
                    alt="Luxury limousine interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-lime rounded-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Fleet Section */}
        <FleetShowcase />

        {/* Booking Section */}
        <BookingSection />

        {/* Reviews Section */}
        <ReviewsSection />

        {/* Footer */}
        <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-outline/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime rounded-md flex items-center justify-center">
                  <span className="text-black font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                    B
                  </span>
                </div>
                <div>
                  <p className="text-primary font-semibold">UFirst Limos</p>
                  <p className="text-xs text-on-surface-variant">A subsidiary of Black Excellence Enterprises</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-on-surface-variant">
                <a href="tel:+14105550123" className="hover:text-primary transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
                  +1 (410) 555-0123
                </a>
                <a href="mailto:info@blkexcellenceenterprise.com" className="hover:text-primary transition-colors">
                  info@blkexcellenceenterprise.com
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-outline/20 text-center text-sm text-on-surface-variant">
              <p>© 2024 Black Excellence Enterprises. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
