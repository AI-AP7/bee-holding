"use client";

export default function KJFooter() {
  return (
    <footer
      style={{
        background: "#0b1326",
        padding: "4rem 0 2rem",
        borderTop: "1px solid rgba(208, 188, 255, 0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "#dae2fd",
                marginBottom: "1rem",
              }}
            >
              K&amp;J Sound<span style={{ color: "#ffe083" }}> Co.</span>
            </h3>
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.875rem",
                color: "#958ea0",
                maxWidth: "300px",
                lineHeight: 1.6,
              }}
            >
              Professional event production and custom AV installations serving Maryland and the East Coast.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="kj-label mb-6">Quick Links</h4>
            <ul className="space-y-3" style={{ listStyle: "none", padding: 0 }}>
              {[
                { label: "Events", href: "#events" },
                { label: "Installations", href: "#installations" },
                { label: "Portfolio", href: "#portfolio" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontSize: "0.875rem",
                      color: "#958ea0",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#d0bcff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#958ea0")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="kj-label mb-6">Contact</h4>
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: "0.875rem",
                color: "#958ea0",
                lineHeight: 1.6,
              }}
            >
              Maryland &amp; East Coast Region
              <br />
              <a
                href="mailto:chairman@blkexcellenceenterprise.com"
                style={{ color: "#ffe083", textDecoration: "none" }}
              >
                chairman@blkexcellenceenterprise.com
              </a>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-outline/10"
          style={{
            borderColor: "rgba(149, 142, 160, 0.1)",
          }}
        >
          <p
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "0.75rem",
              color: "#958ea0",
            }}
          >
            © {new Date().getFullYear()} K&amp;J Sound Company. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "0.75rem",
              color: "#958ea0",
            }}
          >
            A <span style={{ color: "#dae2fd" }}>BEE</span> Enterprise
          </p>
        </div>
      </div>
    </footer>
  );
}
