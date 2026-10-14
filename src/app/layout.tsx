import type { Metadata } from "next";
import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import SiteFrame from "@/components/SiteFrame";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.superstartravelcabs.com"),

  title: {
    default: "Sri Lanka Tourist Transport | Cars, Vans & Buses",
    template: "%s | Super Star Travel",
  },

  description:
    "Book cars, vans and buses in Sri Lanka for airport transfers, private tours and island-wide travel. Find the right vehicle for your trip with Super Star Travel.",

  keywords: [
    "Sri Lanka tourist transport",
    "Sri Lanka car hire with driver",
    "Sri Lanka van hire",
    "Sri Lanka bus hire",
    "Sri Lanka airport transfer",
    "Colombo airport transfer",
    "Sri Lanka private tours",
    "Sri Lanka vehicle booking",
  ],

  authors: [{ name: "Super Star Travel" }],
  creator: "Super Star Travel",
  publisher: "Super Star Travel",

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://www.superstartravelcabs.com",
  },

  openGraph: {
    type: "website",
    url: "https://www.superstartravelcabs.com",
    title: "Sri Lanka Tourist Transport | Cars, Vans & Buses",
    description:
      "Book cars, vans and buses for Sri Lanka airport transfers, private tours and island-wide travel with Super Star Travel.",
    siteName: "Super Star Travel",
    images: [
      {
        url: "https://www.superstartravelcabs.com/images/banner.webp",
        width: 1200,
        height: 630,
        alt: "Super Star Travel vehicles for trips around Sri Lanka",
      },
    ],
    locale: "en_LK",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sri Lanka Tourist Transport | Cars, Vans & Buses",
    description:
      "Book cars, vans and buses for airport transfers, private tours and island-wide travel in Sri Lanka.",
    images: ["https://www.superstartravelcabs.com/images/banner.webp"],
  },

  category: "travel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable} scroll-smooth`}
    >
      <body className="bg-white text-gray-800 antialiased font-sans">

        {/* ✅ Schema Markup (VERY IMPORTANT FOR SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TaxiService",
              name: "Super Star Travel",
              url: "https://www.superstartravelcabs.com",
              areaServed: {
                "@type": "Country",
                name: "Sri Lanka",
              },
              serviceType: [
                "Tourist transport",
                "Car hire",
                "Van hire",
                "Bus hire",
                "Airport transfers",
                "Private tours",
              ],
              description:
                "Book cars, vans and buses for airport transfers, private tours and travel around Sri Lanka.",
            }),
          }}
        />

        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}