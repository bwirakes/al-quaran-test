import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSurah, getVerses } from "@/lib/quran-data";
import { VerseCard } from "@/components/quran/verse-card";
import { VerseSkeleton } from "@/components/quran/surah-list-skeleton";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getRevelationType } from "@/lib/quran-data";

interface SurahPageProps {
  params: Promise<{ surah: string }>;
}

// Generate dynamic SEO metadata for each surah
export async function generateMetadata({
  params,
}: SurahPageProps): Promise<Metadata> {
  const { surah: surahParam } = await params;
  const surahNumber = parseInt(surahParam, 10);

  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return { title: "Surah Tidak Ditemukan" };
  }

  const surah = await getSurah(surahNumber);

  if (!surah) {
    return { title: "Surah Tidak Ditemukan" };
  }

  const revelationType = getRevelationType(surah.revelation_place);
  const title = `Surah ${surah.name_simple} (${surah.name_arabic}) - ${surah.translated_name?.name} | Al-Quran Digital`;
  const description = `Baca Surah ${surah.name_simple} lengkap dengan terjemahan Indonesia. ${surah.verses_count} ayat, Surah ke-${surahNumber}, ${revelationType}. ${surah.translated_name?.name} - Al-Quran Digital.`;

  const url = `https://quran.example.com/quran/${surahNumber}`;

  return {
    title,
    description,
    keywords: [
      `surah ${surah.name_simple}`,
      `surah ${surah.name_simple} terjemahan`,
      `surah ${surah.name_simple} bahasa indonesia`,
      surah.translated_name?.name || "",
      surah.name_arabic,
      "al-quran",
      "terjemahan indonesia",
      "quran digital",
      "baca quran online",
      revelationType.toLowerCase(),
      `surah ke-${surahNumber}`,
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: "Al-Quran Digital Indonesia",
      type: "article",
      locale: "id_ID",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
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
  };
}

// JSON-LD structured data for surah
function SurahJsonLd({
  surah,
  surahNumber,
}: {
  surah: {
    name_simple: string;
    name_arabic: string;
    verses_count: number;
    revelation_place: string;
    translated_name?: { name: string };
  };
  surahNumber: number;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    "@id": `https://quran.example.com/quran/${surahNumber}`,
    name: `Surah ${surah.name_simple}`,
    alternateName: [surah.name_arabic, surah.translated_name?.name],
    description: `${surah.translated_name?.name} - Surah ke-${surahNumber} dalam Al-Quran dengan ${surah.verses_count} ayat`,
    position: surahNumber,
    numberOfPages: surah.verses_count,
    inLanguage: ["ar", "id"],
    isPartOf: {
      "@type": "Book",
      name: "Al-Quran",
      alternateName: "القرآن الكريم",
      inLanguage: "ar",
      numberOfPages: 604,
    },
    publisher: {
      "@type": "Organization",
      name: "Al-Quran Digital Indonesia",
      url: "https://quran.example.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://quran.example.com/quran/${surahNumber}`,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Al-Quran",
          item: "https://quran.example.com/quran",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `Surah ${surah.name_simple}`,
          item: `https://quran.example.com/quran/${surahNumber}`,
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

async function VerseList({ surahNumber }: { surahNumber: number }) {
  const { verses } = await getVerses(surahNumber, 1, 286);

  if (!verses || verses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">
          Gagal memuat ayat-ayat. Silakan coba lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verses.map((verse) => (
        <VerseCard key={verse.id} verse={verse} surahNumber={surahNumber} />
      ))}
    </div>
  );
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { surah: surahParam } = await params;
  const surahNumber = parseInt(surahParam, 10);

  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    notFound();
  }

  const surah = await getSurah(surahNumber);

  if (!surah) {
    notFound();
  }

  const isMakki = surah.revelation_place === "makkah";

  return (
    <>
      {/* JSON-LD Structured Data */}
      <SurahJsonLd surah={surah} surahNumber={surahNumber} />

      <div className="min-h-screen bg-white">
        {/* Floating Header */}
        <header className="fixed top-4 left-4 right-4 z-50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left: Back + Surah Info */}
                <div className="flex items-center gap-3">
                  <Link href="/quran">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 transition-colors hover:bg-stone-200">
                      <ArrowLeft className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                    </button>
                  </Link>
                  <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                    <span className="font-bold text-sm font-serif" style={{ color: '#496580' }}>{surah.id}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-bold tracking-tight text-slate-900 font-serif">
                        {surah.name_simple}
                      </h1>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isMakki 
                          ? "bg-stone-100 text-slate-600" 
                          : "bg-slate-900 text-white"
                      }`}>
                        {getRevelationType(surah.revelation_place)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 -mt-0.5">
                      {surah.translated_name?.name} · {surah.verses_count} Ayat
                    </p>
                  </div>
                </div>
                
                {/* Right: Arabic Name - Blue Color */}
                <p 
                  className="text-xl hidden sm:block"
                  style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
                  lang="ar"
                  dir="rtl"
                >
                  {surah.name_arabic}
                </p>
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
            <li>
              <Link href="/quran" className="hover:text-sky-600 transition-colors">
                Al-Quran
              </Link>
            </li>
            <li className="text-stone-300">/</li>
            <li className="text-slate-900 font-medium" aria-current="page">
              {surah.name_simple}
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Bismillah - except for Surah At-Tawbah (9) - Blue Arabic Text */}
          {surah.bismillah_pre && (
            <div className="text-center py-8 mb-6 border border-sky-200 rounded-2xl bg-sky-50/50">
              <p 
                className="text-3xl md:text-4xl"
                style={{ fontFamily: '"Scheherazade New", serif', lineHeight: 2, color: '#496580' }}
                lang="ar"
                dir="rtl"
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="text-sm text-slate-500 mt-3">
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
              </p>
            </div>
          )}

          {/* Verses */}
          <Suspense fallback={<VerseSkeleton />}>
            <VerseList surahNumber={surahNumber} />
          </Suspense>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
            {surahNumber > 1 ? (
              <Link href={`/quran/${surahNumber - 1}`}>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                  Surah Sebelumnya
                </button>
              </Link>
            ) : (
              <div />
            )}
            {surahNumber < 114 ? (
              <Link href={`/quran/${surahNumber + 1}`}>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                  Surah Berikutnya
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surah: (i + 1).toString(),
  }));
}
