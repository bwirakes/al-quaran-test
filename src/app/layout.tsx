import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://quran.example.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Al-Quran Digital - Baca Quran Online dengan Terjemahan Indonesia",
    template: "%s | Al-Quran Digital Indonesia",
  },
  description:
    "Baca Al-Quran online lengkap dengan terjemahan bahasa Indonesia. 114 surah, 6236 ayat dengan tafsir dan audio. Platform Quran digital terbaik untuk umat Muslim Indonesia.",
  keywords: [
    "al-quran",
    "quran digital",
    "baca quran online",
    "terjemahan quran indonesia",
    "quran bahasa indonesia",
    "surah al-quran",
    "ayat quran",
    "tafsir quran",
    "quran online gratis",
    "aplikasi quran",
    "quran indonesia",
    "mushaf digital",
    "114 surah",
    "al fatihah",
    "al baqarah",
    "yasin",
    "ar rahman",
    "al mulk",
    "ayatul kursi",
    "juz amma",
  ],
  authors: [{ name: "Al-Quran Digital Indonesia" }],
  creator: "Al-Quran Digital Indonesia",
  publisher: "Al-Quran Digital Indonesia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "Al-Quran Digital Indonesia",
    title: "Al-Quran Digital - Baca Quran Online dengan Terjemahan Indonesia",
    description:
      "Baca Al-Quran online lengkap dengan terjemahan bahasa Indonesia. 114 surah, 6236 ayat dengan tafsir dan audio. Platform Quran digital terbaik.",
  },
  twitter: {
    card: "summary",
    title: "Al-Quran Digital - Baca Quran Online dengan Terjemahan Indonesia",
    description:
      "Baca Al-Quran online lengkap dengan terjemahan bahasa Indonesia. 114 surah, 6236 ayat.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "id-ID": BASE_URL,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "religion",
};

// Global JSON-LD structured data for the website
function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Al-Quran Digital Indonesia",
        description:
          "Baca Al-Quran online lengkap dengan terjemahan bahasa Indonesia",
        inLanguage: ["id", "ar"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/quran/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "Al-Quran Digital Indonesia",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/logo.png`,
        },
      },
      {
        "@type": "Book",
        "@id": `${BASE_URL}/quran/#book`,
        name: "Al-Quran",
        alternateName: ["القرآن الكريم", "The Holy Quran"],
        inLanguage: "ar",
        numberOfPages: 604,
        genre: "Religious text",
        about: {
          "@type": "Thing",
          name: "Islam",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" dir="ltr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://api.quran.com" />
        <link rel="dns-prefetch" href="https://api.quran.com" />
        <WebsiteJsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
