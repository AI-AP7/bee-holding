import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { organizationSchema } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Black Excellence Enterprises",
  description:
    "Black Excellence Enterprises is a holding company overseeing premium transportation and professional audio services.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://blkexcellenceenterprise.com"),
  openGraph: {
    title: "Black Excellence Enterprises",
    description: "Premium transportation and professional audio services.",
    url: "https://blkexcellenceenterprise.com",
    siteName: "Black Excellence Enterprises",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Excellence Enterprises",
    description: "Premium transportation and professional audio services.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const squareEnvironment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";
  const squareScriptSource =
    squareEnvironment === "production"
      ? "https://web.squarecdn.com/v1/square.js"
      : "https://sandbox.web.squarecdn.com/v1/square.js";

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script src={squareScriptSource} strategy="afterInteractive" />
      </head>
      <body className="antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
