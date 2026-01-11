import Link from "next/link";
import { BookOpen, Search, Star } from "lucide-react";
import { getAllSurahs } from "@/lib/quran-data";
import { SurahCard } from "@/components/quran/surah-card";
import { SurahListSkeleton } from "@/components/quran/surah-list-skeleton";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar 114 Surah Al-Quran Lengkap - Terjemahan Indonesia | Al-Quran Digital",
  description: "Daftar lengkap 114 Surah Al-Quran dengan terjemahan bahasa Indonesia dari Kemenag. Baca Al-Fatihah hingga An-Nas online. Dilengkapi pencarian ayat, teks Arab, dan tafsir.",
  keywords: ["daftar surah", "114 surah", "al-quran lengkap", "surah al-quran", "index quran", "terjemahan indonesia", "quran online"],
  openGraph: {
    title: "Daftar 114 Surah Al-Quran Lengkap - Terjemahan Indonesia",
    description: "Baca 114 Surah Al-Quran lengkap dengan terjemahan bahasa Indonesia. Al-Fatihah hingga An-Nas.",
    type: "website",
    locale: "id_ID",
    images: [{ url: "/api/og?title=Daftar Surah Al-Quran&subtitle=114 Surah Lengkap" }],
  },
  alternates: {
    canonical: "/quran"
  }
};

// JSON-LD structured data
function QuranIndexJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Daftar 114 Surah Al-Quran",
    description: "Daftar lengkap 114 surah Al-Quran dengan terjemahan bahasa Indonesia",
    url: "/quran",
    mainEntity: {
      "@type": "Book",
      name: "Al-Quran",
      alternateName: "القرآن الكريم",
      inLanguage: ["ar", "id"],
      numberOfPages: 604,
      hasPart: Array.from({ length: 114 }, (_, i) => ({
        "@type": "Chapter",
        position: i + 1,
        name: `Surah ${i + 1}`,
        url: `/quran/${i + 1}`
      }))
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

async function SurahList() {
  const surahs = await getAllSurahs();
  
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {surahs.map((surah) => (
        <SurahCard key={surah.id} surah={surah} />
      ))}
    </div>
  );
}

export default async function QuranIndexPage() {
  const surahs = await getAllSurahs();

  // Popular surahs for quick access
  const popularSurahs = [1, 36, 55, 56, 67, 78, 112, 114].map(id => 
    surahs.find(s => s.id === id)
  ).filter(Boolean);

  return (
    <>
      <QuranIndexJsonLd />
      <div className="min-h-screen bg-white">
        {/* Floating Header */}
        <header className="fixed top-4 left-4 right-4 z-50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left: Logo + Title */}
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-sky-200 rounded-lg flex items-center justify-center bg-sky-50">
                    <BookOpen className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight text-slate-900">
                      Daftar Surah
                    </h1>
                    <p className="text-xs text-slate-500 -mt-0.5">
                      114 Surah · 6236 Ayat
                    </p>
                  </div>
                </Link>
                
                {/* Right: Search + AI */}
                <nav className="flex items-center gap-1">
                  <Link 
                    href="/quran/search" 
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    <Search className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                  <Link 
                    href="/chat" 
                    className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#496580' }}
                  >
                    Asisten AI
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-20" />

        {/* Breadcrumb */}
        <nav className="max-w-3xl mx-auto px-4 py-3 border-b border-stone-100" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-sky-600 transition-colors">
                Beranda
              </Link>
            </li>
            <li className="text-stone-300">/</li>
            <li className="text-slate-900 font-medium" aria-current="page">
              Daftar Surah
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Popular Surahs */}
          <section className="mb-10" aria-labelledby="popular-surahs">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
              <h2 id="popular-surahs" className="text-sm font-medium text-slate-900 uppercase tracking-wider">
                Surah Populer
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSurahs.map((surah) => surah && (
                <Link
                  key={surah.id}
                  href={`/quran/${surah.id}`}
                  className="px-4 py-2 border border-stone-200 rounded-lg bg-white hover:border-sky-300 hover:bg-sky-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-slate-900 group-hover:text-sky-700 transition-colors">{surah.name_simple}</span>
                  <span className="text-xs text-slate-400 ml-2">{surah.verses_count} Ayat</span>
                </Link>
              ))}
            </div>
          </section>

          {/* All Surahs */}
          <section aria-labelledby="all-surahs">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 id="all-surahs" className="text-sm font-medium text-slate-900 uppercase tracking-wider">
                  Semua Surah
                </h2>
                <span className="text-xs px-2 py-0.5 bg-stone-100 rounded-md text-slate-600">114</span>
              </div>
            </div>

            {/* Surah Grid */}
            <Suspense fallback={<SurahListSkeleton />}>
              <SurahList />
            </Suspense>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
