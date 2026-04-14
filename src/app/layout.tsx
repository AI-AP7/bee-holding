import type { Metadata } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { organizationSchema } from "@/lib/schemas";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

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
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
