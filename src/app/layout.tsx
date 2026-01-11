import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Al-Quran Digital - Terjemahan Indonesia & Panduan AI",
  description:
    "Aplikasi Al-Quran digital dengan terjemahan bahasa Indonesia dan asisten AI untuk panduan Islam. Baca, pelajari, dan pahami Al-Quran dengan mudah.",
  keywords: ["quran", "al-quran", "terjemahan", "indonesia", "islam", "muslim", "panduan"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
