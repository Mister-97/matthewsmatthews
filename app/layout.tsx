import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matthews & Matthews Property Investment & Management | Tampa, FL",
  description:
    "Matthews & Matthews Property Investment & Management offers full-service property management, tenant placement, maintenance coordination, and investment consulting in the Tampa, FL area. 55+ years of experience. Access your tenant portal online.",
  keywords:
    "property management Tampa FL, property investment Tampa, tenant portal, rental management, Matthews and Matthews, property manager Tampa Bay, residential property management, investment property Tampa",
  robots: "index, follow",
  authors: [{ name: "Matthews & Matthews Property Investment & Management" }],
  alternates: {
    canonical: "https://matthewsandmatthews.com/",
  },
  openGraph: {
    type: "website",
    title: "Matthews & Matthews Property Investment & Management",
    description:
      "Full-service property management and investment consulting in Tampa, FL. Pay rent online, submit maintenance requests, and more through our tenant portal.",
    images: [
      {
        url: "https://i.ibb.co/LDf3XBB5/Screenshot-2026-02-18-at-8-59-50-PM.png",
        width: 1200,
        height: 630,
        alt: "Matthews & Matthews Property Investment & Management",
      },
    ],
    url: "https://matthewsandmatthews.com/",
    siteName: "Matthews & Matthews Property Investment & Management",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matthews & Matthews Property Investment & Management",
    description:
      "Full-service property management and investment consulting in Tampa, FL. Pay rent, submit maintenance requests, and access your lease online.",
    images: ["https://i.ibb.co/LDf3XBB5/Screenshot-2026-02-18-at-8-59-50-PM.png"],
  },
  other: {
    "geo.region": "US-FL",
    "geo.placename": "Tampa, Florida",
    "geo.position": "27.9506;-82.4572",
    ICBM: "27.9506, -82.4572",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Matthews & Matthews Property Investment & Management",
  description:
    "Full-service property investment and management company serving the Tampa, FL area. Services include tenant placement, rent collection, maintenance coordination, lease management, and investment consulting.",
  url: "https://matthewsandmatthews.com",
  logo: "https://i.ibb.co/0yhg1SMc/matthews-property-logo.png",
  image: "https://i.ibb.co/LDf3XBB5/Screenshot-2026-02-18-at-8-59-50-PM.png",
  telephone: "+1-330-719-6908",
  email: "info@matthewsandmatthews.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tampa",
    addressRegion: "FL",
    addressCountry: "US",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Property Management Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Property Management" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tenant Placement" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Maintenance Coordination" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lease Management" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Investment Consulting" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Online Rent Collection" } },
    ],
  },
  foundingDate: "1970",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I pay rent online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tenants can pay rent online anytime through the Matthews & Matthews tenant portal at https://matthewsandmatthews.com/login.",
      },
    },
    {
      "@type": "Question",
      name: "How do I submit a maintenance request?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Log into your tenant portal at https://matthewsandmatthews.com/login to submit and track maintenance requests from any device.",
      },
    },
    {
      "@type": "Question",
      name: "What areas does Matthews & Matthews serve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Matthews & Matthews Property Investment & Management serves the Tampa, Florida area and surrounding communities.",
      },
    },
    {
      "@type": "Question",
      name: "How do I contact Matthews & Matthews?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Call 330-719-6908 or email info@matthewsandmatthews.com. Office hours are Monday through Friday, 9 AM to 6 PM.",
      },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
