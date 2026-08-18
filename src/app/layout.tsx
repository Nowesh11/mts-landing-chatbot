import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ChatWidget } from "@/components/chat/chat-widget";
import { StructuredData } from "@/components/seo/structured-data";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = "https://mt-smart.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "MT Smart Industries | Integrated Waste & Resource Management Malaysia",
    template: "%s | MT Smart Industries",
  },
  description:
    "Practical solutions that help businesses manage waste responsibly, recover valuable resources and build more sustainable operations. Industrial waste management, controlled dismantling, material recovery, and construction waste solutions in Bukit Mertajam, Penang.",
  keywords: [
    "waste management Malaysia",
    "industrial waste management Penang",
    "construction waste management",
    "controlled dismantling demolition",
    "scrap metal recovery Malaysia",
    "material recovery Penang",
    "RORO bin services",
    "ESG waste management",
    "Bukit Mertajam waste company",
  ],
  authors: [{ name: "MT Smart Industries Sdn Bhd" }],
  creator: "MT Smart Industries Sdn Bhd",
  publisher: "MT Smart Industries Sdn Bhd",

  // Controls how the page appears when shared on Facebook, LinkedIn,
  // WhatsApp link previews, etc. — not Google search directly, but
  // heavily affects click-through when people share/link to you.
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: SITE_URL,
    siteName: "MT Smart Industries",
    title: "MT Smart Industries | Integrated Waste & Resource Management",
    description:
      "Practical solutions for industrial and construction waste management, dismantling, and resource recovery in Malaysia.",
    images: [
      {
        url: "/images/hero.png", // ← ideally a dedicated 1200x630 OG image
        width: 1200,
        height: 630,
        alt: "MT Smart Industries — Integrated Waste & Resource Management",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MT Smart Industries | Integrated Waste & Resource Management",
    description:
      "Practical solutions for industrial and construction waste management in Malaysia.",
    images: ["/images/hero.png"],
  },

  // Tells Google exactly which URL is the "real" one for this content —
  // prevents duplicate-content confusion if the site is ever reachable
  // via multiple URLs (with/without www, http/https, trailing slash).
  alternates: {
    canonical: SITE_URL,
  },

  // Explicit instruction that indexing/crawling is allowed and encouraged
  // — belt-and-suspenders alongside robots.ts.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Once you set up Google Search Console (search.google.com/search-console),
  // paste the verification code it gives you here — proves domain
  // ownership without adding a separate HTML file.
  verification: {
    google: "PASTE_YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE_HERE",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy text-offwhite">
        <StructuredData />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <ChatWidget />
      </body>
    </html>
  );
}