import type { Metadata } from "next";
import { Fredoka, DM_Sans, Righteous } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CategoriesProvider } from "@/lib/contexts/CategoriesContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pwpcoloringpages.com'),
  title: {
    default: "Free Printable Coloring Pages for Kids & Adults | Paint With Purpose",
    template: "%s | Paint With Purpose",
  },
  description: "Download and print free coloring pages for kids, teens, and adults. 500+ printable PDF coloring sheets — animals, nature, characters, mandalas and more. 100% free, no sign-up.",
  keywords: [
    // Tier 1 — head terms
    "free coloring pages",
    "free printable coloring pages",
    "printable coloring pages",
    // Tier 2 — age-intent long-tail
    "coloring pages for kids",
    "coloring pages for adults printable",
    "easy coloring pages for kids",
    "coloring pages for toddlers",
    "coloring pages for adults PDF",
    // Tier 2 — category-specific quick wins
    "kpop coloring pages free printable",
    "bts coloring pages free printable",
    "blackpink coloring pages printable",
    "dinosaur coloring pages free printable",
    "animal coloring pages printable free",
    "farm animal coloring pages toddlers",
    "unicorn coloring pages free printable",
    "halloween coloring pages not scary",
    "halloween coloring pages for toddlers",
    "princess coloring pages for girls",
    "car coloring pages for boys",
    "hello kitty coloring pages printable",
    "mandala coloring pages free printable",
    "flower coloring pages printable",
    "butterfly coloring pages free printable",
    // Tier 3 — zero-competition brand/niche
    "free pdf coloring pages no sign up",
    "print coloring pages at home free",
    "coloring pages for 3 year olds printable",
    "detailed coloring pages for adults stress relief",
  ],
  authors: [{ name: "Paint With Purpose" }],
  creator: "Paint With Purpose",
  publisher: "Paint With Purpose",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pwpcoloringpages.com",
    siteName: "Paint With Purpose",
    title: "Free Printable Coloring Pages for Kids & Adults | Paint With Purpose",
    description: "Download and print free coloring pages for kids, teens, and adults. 500+ printable PDF coloring sheets — animals, nature, characters, mandalas and more. 100% free.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Paint With Purpose — Free Printable Coloring Pages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Printable Coloring Pages for Kids & Adults | Paint With Purpose",
    description: "500+ free printable coloring pages — animals, characters, nature, mandalas & more. Download as PDF instantly. No sign-up needed.",
    images: ["/logo.png"],
    creator: "@paintwithpurpose",
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  alternates: {
    canonical: "https://pwpcoloringpages.com",
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Paint With Purpose',
      url: 'https://pwpcoloringpages.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://pwpcoloringpages.com/free-coloring-pages?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://pwpcoloringpages.com/#organization',
      name: 'Paint With Purpose',
      url: 'https://pwpcoloringpages.com',
      logo: 'https://pwpcoloringpages.com/logo.png',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <GoogleAnalytics />
      </head>
      <body
        className={`${fredoka.variable} ${dmSans.variable} ${righteous.variable} antialiased`}
        style={{ fontFamily: 'var(--font-dm-sans)' }}
        suppressHydrationWarning
      >
        <CategoriesProvider>
          <Header />
          {children}
          <Footer />
        </CategoriesProvider>
      </body>
    </html>
  );
}
