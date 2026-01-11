import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSurah, getVerseByKey } from "@/lib/quran-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { getRevelationType } from "@/lib/quran-data";

interface VersePageProps {
  params: Promise<{ surah: string; verse: string }>;
}

// Generate static params for all verses in all surahs
export async function generateStaticParams() {
  const verseCounts = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
    111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
    54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
    49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
    44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
    26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
    6, 3, 5, 4, 5, 6,
  ];

  const params: { surah: string; verse: string }[] = [];

  for (let surah = 1; surah <= 114; surah++) {
    const verseCount = verseCounts[surah - 1];
    for (let verse = 1; verse <= verseCount; verse++) {
      params.push({
        surah: surah.toString(),
        verse: verse.toString(),
      });
    }
  }

  return params;
}

// Generate dynamic metadata for each verse
export async function generateMetadata({
  params,
}: VersePageProps): Promise<Metadata> {
  const { surah: surahParam, verse: verseParam } = await params;
  const surahNumber = parseInt(surahParam, 10);
  const verseNumber = parseInt(verseParam, 10);

  if (isNaN(surahNumber) || isNaN(verseNumber)) {
    return { title: "Ayat Tidak Ditemukan" };
  }

  const surah = await getSurah(surahNumber);
  const verse = await getVerseByKey(`${surahNumber}:${verseNumber}`);

  if (!surah || !verse) {
    return { title: "Ayat Tidak Ditemukan" };
  }

  const translationText =
    verse.translations?.[0]?.text
      ?.replace(/<[^>]*>/g, "")
      .replace(/&quot;/g, '"')
      .slice(0, 155) + "..." || "";

  const title = `Surah ${surah.name_simple} Ayat ${verseNumber} - ${surah.translated_name?.name} | Al-Quran Digital`;
  const description = `Baca Surah ${surah.name_simple} (${surah.name_arabic}) Ayat ${verseNumber} dengan terjemahan Indonesia: "${translationText}"`;

  const url = `https://quran.example.com/quran/${surahNumber}/${verseNumber}`;

  return {
    title,
    description,
    keywords: [
      `surah ${surah.name_simple}`,
      `surah ${surah.name_simple} ayat ${verseNumber}`,
      surah.translated_name?.name || "",
      surah.name_arabic,
      "al-quran",
      "terjemahan indonesia",
      "ayat quran",
      `${surah.name_simple} ${verseNumber}`,
      "quran digital",
      "baca quran online",
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: "Al-Quran Digital Indonesia",
      type: "article",
      locale: "id_ID",
      images: [
        {
          url: `/api/og?surah=${surahNumber}&verse=${verseNumber}`,
          width: 1200,
          height: 630,
          alt: `Surah ${surah.name_simple} Ayat ${verseNumber}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?surah=${surahNumber}&verse=${verseNumber}`],
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

// Helper to clean HTML from translation
function cleanTranslation(text: string) {
  return text.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"');
}

// JSON-LD structured data component
function VerseJsonLd({
  surah,
  verse,
  surahNumber,
  verseNumber,
}: {
  surah: { name_simple: string; name_arabic: string; translated_name?: { name: string } };
  verse: { text_uthmani: string; translations?: { text: string }[] };
  surahNumber: number;
  verseNumber: number;
}) {
  const translationText = verse.translations?.[0]?.text
    ? cleanTranslation(verse.translations[0].text)
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `https://quran.example.com/quran/${surahNumber}/${verseNumber}`,
    headline: `Surah ${surah.name_simple} Ayat ${verseNumber} - ${surah.translated_name?.name}`,
    description: translationText.slice(0, 200),
    inLanguage: ["ar", "id"],
    isPartOf: {
      "@type": "Book",
      name: "Al-Quran",
      alternateName: "القرآن الكريم",
      inLanguage: "ar",
    },
    position: verseNumber,
    text: verse.text_uthmani,
    publisher: {
      "@type": "Organization",
      name: "Al-Quran Digital Indonesia",
      url: "https://quran.example.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://quran.example.com/quran/${surahNumber}/${verseNumber}`,
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
        {
          "@type": "ListItem",
          position: 3,
          name: `Ayat ${verseNumber}`,
          item: `https://quran.example.com/quran/${surahNumber}/${verseNumber}`,
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

async function VerseContent({
  surahNumber,
  verseNumber,
}: {
  surahNumber: number;
  verseNumber: number;
}) {
  const verse = await getVerseByKey(`${surahNumber}:${verseNumber}`);

  if (!verse) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">
          Gagal memuat ayat. Silakan coba lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-2xl bg-white">
      <article className="p-8">
        {/* Arabic Text - Blue Color #496580 */}
        <section className="mb-8 pb-8 border-b border-stone-100" aria-label="Teks Arab">
          <p
            className="text-4xl md:text-5xl leading-[2] text-right"
            style={{ 
              fontFamily: '"Scheherazade New", serif',
              color: '#496580',
              lineHeight: 2.2
            }}
            dir="rtl"
            lang="ar"
          >
            {verse.text_uthmani}
          </p>
        </section>

        {/* Indonesian Translation */}
        {verse.translations && verse.translations.length > 0 && (
          <section aria-label="Terjemahan Indonesia">
            <h2 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
              Terjemahan Indonesia
            </h2>
            <p className="text-slate-700 leading-relaxed text-lg" lang="id">
              {cleanTranslation(verse.translations[0].text)}
            </p>
          </section>
        )}
      </article>
    </div>
  );
}

function VerseSkeleton() {
  return (
    <div className="border border-stone-200 rounded-2xl bg-white">
      <div className="p-8">
        <div className="mb-8 pb-8 border-b border-stone-100">
          <Skeleton className="h-16 w-full bg-stone-100" />
        </div>
        <Skeleton className="h-4 w-1/4 mb-3 bg-stone-100" />
        <Skeleton className="h-6 w-full mb-2 bg-stone-50" />
        <Skeleton className="h-6 w-3/4 bg-stone-50" />
      </div>
    </div>
  );
}

export default async function VersePage({ params }: VersePageProps) {
  const { surah: surahParam, verse: verseParam } = await params;
  const surahNumber = parseInt(surahParam, 10);
  const verseNumber = parseInt(verseParam, 10);

  if (
    isNaN(surahNumber) ||
    surahNumber < 1 ||
    surahNumber > 114 ||
    isNaN(verseNumber) ||
    verseNumber < 1
  ) {
    notFound();
  }

  const surah = await getSurah(surahNumber);

  if (!surah || verseNumber > surah.verses_count) {
    notFound();
  }

  const verse = await getVerseByKey(`${surahNumber}:${verseNumber}`);
  const isMakki = surah.revelation_place === "makkah";

  const prevVerse = verseNumber > 1 ? verseNumber - 1 : null;
  const nextVerse = verseNumber < surah.verses_count ? verseNumber + 1 : null;
  const prevSurah = surahNumber > 1 ? surahNumber - 1 : null;
  const nextSurah = surahNumber < 114 ? surahNumber + 1 : null;

  return (
    <>
      {/* JSON-LD Structured Data */}
      {verse && (
        <VerseJsonLd
          surah={surah}
          verse={verse}
          surahNumber={surahNumber}
          verseNumber={verseNumber}
        />
      )}

      <div className="min-h-screen bg-stone-50">
        {/* Floating Header */}
        <header className="fixed top-4 left-4 right-4 z-50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left: Back + Verse Info */}
                <div className="flex items-center gap-3">
                  <Link href={`/quran/${surahNumber}`}>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 transition-colors hover:bg-stone-200">
                      <ArrowLeft className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                    </button>
                  </Link>
                  <div className="w-auto h-9 px-3 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                    <span className="font-bold text-sm" style={{ color: '#496580' }}>
                      {surahNumber}:{verseNumber}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-bold tracking-tight text-slate-900">
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
                      Ayat {verseNumber} dari {surah.verses_count}
                    </p>
                  </div>
                </div>
                
                {/* Right: Arabic Name */}
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
        <nav className="max-w-3xl mx-auto px-4 py-3" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li>
              <Link href="/quran" className="hover:text-sky-600 transition-colors">
                Al-Quran
              </Link>
            </li>
            <li className="text-stone-300">/</li>
            <li>
              <Link href={`/quran/${surahNumber}`} className="hover:text-sky-600 transition-colors">
                Surah {surah.name_simple}
              </Link>
            </li>
            <li className="text-stone-300">/</li>
            <li className="text-slate-900 font-medium" aria-current="page">
              Ayat {verseNumber}
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Verse Content */}
          <Suspense fallback={<VerseSkeleton />}>
            <VerseContent surahNumber={surahNumber} verseNumber={verseNumber} />
          </Suspense>

          {/* Related Verses Section */}
          <section className="mt-8" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="text-sm font-medium text-slate-900 mb-4"
            >
              Ayat Lainnya dalam Surah {surah.name_simple}
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(10, surah.verses_count) }, (_, i) => {
                const v = i + 1;
                const isCurrentVerse = v === verseNumber;
                return (
                  <Link key={v} href={`/quran/${surahNumber}/${v}`}>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isCurrentVerse
                          ? "bg-sky-100 border border-sky-300 text-sky-700"
                          : "border border-stone-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50"
                      }`}
                    >
                      {v}
                    </button>
                  </Link>
                );
              })}
              {surah.verses_count > 10 && (
                <Link href={`/quran/${surahNumber}`}>
                  <button className="px-3 py-1.5 rounded-lg text-sm border border-stone-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    Lihat Semua ({surah.verses_count} Ayat)
                  </button>
                </Link>
              )}
            </div>
          </section>

          {/* Navigation */}
          <nav
            className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200"
            aria-label="Navigasi Ayat"
          >
            {prevVerse ? (
              <Link href={`/quran/${surahNumber}/${prevVerse}`}>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                  Ayat {prevVerse}
                </button>
              </Link>
            ) : prevSurah ? (
              <Link href={`/quran/${prevSurah}`}>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                  Surah Sebelumnya
                </button>
              </Link>
            ) : (
              <div />
            )}

            <Link href={`/quran/${surahNumber}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Semua Ayat</span>
              </button>
            </Link>

            {nextVerse ? (
              <Link href={`/quran/${surahNumber}/${nextVerse}`}>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                  Ayat {nextVerse}
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </Link>
            ) : nextSurah ? (
              <Link href={`/quran/${nextSurah}`}>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                  Surah Berikutnya
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
