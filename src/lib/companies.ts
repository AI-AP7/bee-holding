export interface Company {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  cta: string;
  href?: string;
  inquiryType?: "contracting";
}

export const companies: Company[] = [
  {
    id: "ufirst-limos",
    name: "UFirst Limos",
    tagline: "Premium Transportation",
    description:
      "Luxury limousine service serving Maryland, DC, Virginia, and Pennsylvania. Experience elegance on wheels with our premium fleet.",
    imageUrl: "/cadilac_esv.jpg",
    cta: "Book Now",
    href: "/limo",
  },
  {
    id: "kj-sound",
    name: "K & J Sound Company",
    tagline: "Professional Audio",
    description:
      "Professional audio solutions. From custom lighting and sound installations, to top quality live sound and event production, We bring the our clients the best.",
    imageUrl: "/kj_sound.jpg",
    cta: "Learn More",
    href: "/sound",
  },
  {
    id: "contracting-consultation",
    name: "Contracting Consultation",
    tagline: "Design & Project Management",
    description:
      "From architectural design to general contracting, click to inquire about consulting or project management for your next build.",
    imageUrl: "/contracting_2.jpg",
    cta: "Inquire Now",
    inquiryType: "contracting",
  },
];

export const companyCount = companies.length;
