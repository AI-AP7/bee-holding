export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://blkexcellenceenterprise.com/#organization",
  name: "Black Excellence Enterprises",
  alternateName: "BEE",
  foundingDate: "2024",
  description: "Black Excellence Enterprises is a holding company overseeing premium transportation and professional audio services.",
  url: "https://blkexcellenceenterprise.com",
  logo: {
    "@type": "ImageObject",
    url: "https://blkexcellenceenterprise.com/logo.png",
  },
  subsidiary: [
    {
      "@type": "Organization",
      name: "UFirst Limos",
      description: "Premium limousine service in Maryland, DC, Virginia, and Pennsylvania",
      url: "https://blkexcellenceenterprise.com/limo",
    },
    {
      "@type": "Organization",
      name: "K & J Sound Company",
      description: "Professional audio and event production services",
    },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@blkexcellenceenterprise.com",
    contactType: "customer service",
  },
  address: {
    "@type": "PostalAddress",
    addressRegion: "MD",
    addressCountry: "US",
  },
};

export const localBusinessSchema = {
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
      telephone: "+1-410-555-0123",
      email: "info@blkexcellenceenterprise.com",
      priceRange: "$$$",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Maryland",
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "39.0458",
        longitude: "-76.6413",
      },
      areaServed: [
        {
          "@type": "State",
          name: "Maryland",
        },
        {
          "@type": "State",
          name: "District of Columbia",
        },
        {
          "@type": "State",
          name: "Virginia",
        },
        {
          "@type": "State",
          name: "Pennsylvania",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "127",
        bestRating: "5",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Fleet Vehicles",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Black Stretch Limo",
              description: "8-passenger stretch limousine",
            },
            price: "140",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "White Stretch Limo",
              description: "8-passenger stretch limousine",
            },
            price: "140",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Escalade ESV",
              description: "6-passenger luxury SUV with extra luggage space",
            },
            price: "170",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Escalade V",
              description: "6-passenger luxury SUV",
            },
            price: "165",
            priceCurrency: "USD",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Mercedes S-Class",
              description: "4-passenger luxury sedan",
            },
            price: "140",
            priceCurrency: "USD",
          },
        ],
      },
    },
  ],
};

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "UFirst Limos Premium Transportation",
  description:
    "Premium limousine and luxury vehicle rental service with professional chauffeurs. Available for hourly charters, point-to-point transfers, airport pickups, weddings, proms, and corporate events.",
  provider: {
    "@id": "https://blkexcellenceenterprise.com/#organization",
  },
  areaServed: [
    {
      "@type": "State",
      name: "Maryland",
    },
    {
      "@type": "State",
      name: "District of Columbia",
    },
    {
      "@type": "State",
      name: "Virginia",
    },
    {
      "@type": "State",
      name: "Pennsylvania",
    },
  ],
  serviceType: [
    "Limousine Service",
    "Luxury Transportation",
    "Airport Transfer",
    "Wedding Transportation",
    "Corporate Transportation",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Transportation Services",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Hourly Limousine Service",
        description: "Minimum 4-hour rental with professional chauffeur",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          unitCode: "HUR",
          price: "140",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Offer",
        name: "Point-to-Point Transfer",
        description: "Airport pickup/dropoff or direct transport",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "170",
          priceCurrency: "USD",
        },
      },
    ],
  },
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What areas does UFirst Limos service?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "UFirst Limos provides premium transportation services across Maryland, District of Columbia, Virginia, and Pennsylvania.",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum booking time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our hourly service has a minimum booking of 4 hours. Point-to-point transfers are available for single trips.",
      },
    },
    {
      "@type": "Question",
      name: "Do you provide airport transportation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we offer airport transfer services to and from all major airports in our service area including BWI, DCA, and IAD.",
      },
    },
    {
      "@type": "Question",
      name: "Are your vehicles available for wedding transportation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely! Our stretch limousines are perfect for wedding parties. We offer special wedding packages including decorated vehicles and champagne service.",
      },
    },
  ],
};
