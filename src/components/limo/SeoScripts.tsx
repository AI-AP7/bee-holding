"use client";

import { useEffect } from "react";

export default function SeoScripts() {
  useEffect(() => {
    const schemas = [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://blkexcellenceenterprise.com/limo/#localbusiness",
            "@type": "LocalBusiness",
            "@parent": {
              "@id": "https://blkexcellenceenterprise.com/#organization",
            },
            name: "UFirst Limos",
            description:
              "Premium limousine service in Maryland, DC, Virginia, and Pennsylvania. Luxury transportation for weddings, proms, corporate events, and airport transfers.",
            url: "https://blkexcellenceenterprise.com/limo",
            image: "https://blkexcellenceenterprise.com/images/fleet-hero.jpg",
            telephone: "+1-443-680-0071",
            email: "ufirstlimo@gmail.com",
            priceRange: "$$$",
            address: {
              "@type": "PostalAddress",
              addressRegion: "Maryland",
              addressCountry: "US",
            },
            areaServed: [
              { "@type": "State", name: "Maryland" },
              { "@type": "State", name: "District of Columbia" },
              { "@type": "State", name: "Virginia" },
              { "@type": "State", name: "Pennsylvania" },
            ],
            openingHours: "Mo-Su 00:00-23:59",
            paymentAccepted: ["cash", "credit card"],
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "UFirst Limos",
        description: "Premium luxury limousine and transportation service",
        provider: {
          "@type": "Organization",
          name: "Black Excellence Enterprises",
        },
        areaServed: ["Maryland", "DC", "Virginia", "Pennsylvania"],
        serviceType: [
          "Wedding Transportation",
          "Prom Limo Service",
          "Airport Transfer",
          "Corporate Travel",
          "Special Event Transportation",
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What areas do you serve?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We serve Maryland, District of Columbia, Virginia, and Pennsylvania.",
            },
          },
          {
            "@type": "Question",
            name: "What is your minimum booking?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We offer hourly service starting from 1 hour, with a 4-hour bundle discount available.",
            },
          },
          {
            "@type": "Question",
            name: "Do you offer wedding packages?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, we offer special wedding packages including multiple vehicles and red carpet service.",
            },
          },
        ],
      },
    ];

    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      schemas.forEach(() => {
        const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
        scripts.forEach((script) => script.remove());
      });
    };
  }, []);

  return null;
}