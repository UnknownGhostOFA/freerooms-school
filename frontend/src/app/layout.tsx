import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeroom-frontend.vercel.app';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7fb743' },
    { media: '(prefers-color-scheme: dark)', color: '#121614' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FreeRooms School — Live Timetable & 6th Form Study Room Finder",
    template: "%s | FreeRooms School"
  },
  description: "Real-time 2-week study room matrix and timetable aggregator for Wrenn School. Find available Sixth Form study spaces, view Week A/B schedules with zero class collisions.",
  applicationName: "FreeRooms School",
  authors: [{ name: "FreeRooms Student Developers" }],
  generator: "Next.js",
  keywords: [
    "FreeRooms",
    "FreeRooms School",
    "Wrenn School",
    "Wrenn School Sixth Form",
    "Arbor Timetable",
    "Arbor MIS",
    "Study Rooms",
    "6th Form Study",
    "Week A Week B",
    "School Study Space Finder",
    "Free Classroom Finder",
    "Wrenn School Timetable"
  ],
  creator: "FreeRooms Team",
  publisher: "FreeRooms School",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FreeRooms School — Live Timetable & Study Room Finder",
    description: "Discover real-time available 6th Form study spaces and 2-week Arbor academic schedules for Wrenn School.",
    url: SITE_URL,
    siteName: "FreeRooms School",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreeRooms School — Live Timetable & Study Room Finder",
    description: "Real-time 2-week study room matrix for Wrenn School 6th Form students.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FreeRooms School',
    url: SITE_URL,
    description: 'Real-time 2-week study room matrix and timetable aggregator for Wrenn School students.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'Student',
    },
    provider: {
      '@type': 'Organization',
      name: 'FreeRooms School',
      url: SITE_URL,
    },
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f4f6f5] dark:bg-[#121614] text-[#1b2129] dark:text-[#f0f4f1] transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
