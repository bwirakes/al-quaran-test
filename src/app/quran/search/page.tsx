"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchQuran } from "@/lib/quran-data";
import { SearchBar } from "@/components/quran/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, ArrowRight } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<
    Array<{ verse_key: string; text: string; translations: Array<{ text: string }> }>
  >([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchQuran(query).then(({ results, total }) => {
        setResults(results);
        setTotal(total);
        setLoading(false);
      });
    }
  }, [query]);

  const cleanText = (text: string) => {
    return text.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"');
  };

  if (!query) {
    return (
      <div className="text-center py-16">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7" style={{ color: '#496580' }} strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-2">Cari Ayat Al-Quran</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Masukkan kata kunci untuk mencari ayat dalam Al-Quran dengan terjemahan Indonesia
        </p>
        {/* Popular search suggestions */}
        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-4">Pencarian Populer</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Sabar", "Rezeki", "Taubat", "Syukur", "Doa"].map((term) => (
              <Link 
                key={term}
                href={`/quran/search?q=${term.toLowerCase()}`} 
                className="px-4 py-2 border border-stone-200 rounded-xl text-sm text-slate-600 bg-white hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition-all hover:shadow-sm"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border border-stone-200 rounded-2xl bg-white">
            <Skeleton className="h-5 w-24 mb-3 bg-stone-100" />
            <Skeleton className="h-4 w-full mb-2 bg-stone-50" />
            <Skeleton className="h-4 w-3/4 bg-stone-50" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600">
          Tidak ditemukan hasil untuk &quot;{query}&quot;
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Coba gunakan kata kunci lain atau periksa ejaan
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        Ditemukan <span className="font-semibold text-slate-900">{total}</span> ayat untuk &quot;<span className="font-semibold text-slate-900">{query}</span>&quot;
      </p>
      <div className="space-y-3">
        {results.map((result, index) => {
          const [surahNum, verseNum] = result.verse_key.split(":");
          const verseUrl = `/quran/${surahNum}/${verseNum}`;
          
          return (
            <article key={index} itemScope itemType="https://schema.org/Article">
              <Link
                href={verseUrl}
                title={`Baca Surah ${surahNum} Ayat ${verseNum} selengkapnya`}
                className="block group"
              >
                  <div className="p-4 border border-stone-200 rounded-2xl bg-white hover:border-sky-300 hover:bg-sky-50/50 transition-all hover:shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-medium px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-lg group-hover:bg-sky-100 transition-colors"
                        style={{ color: '#496580' }}
                        itemProp="position"
                      >
                        Surah {surahNum} : Ayat {verseNum}
                      </span>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-sky-600 transition-colors" strokeWidth={1.5} />
                  </div>
                  {result.translations && result.translations[0] && (
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed" itemProp="description">
                      {cleanText(result.translations[0].text)}
                    </p>
                  )}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back + Title */}
              <div className="flex items-center gap-3">
                <Link href="/quran">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 transition-colors hover:bg-stone-200">
                    <ArrowLeft className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                  </button>
                </Link>
                <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                  <Search className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-slate-900 font-serif">
                    Cari Ayat
                  </h1>
                  <p className="text-xs text-slate-500 -mt-0.5">
                    Temukan ayat Al-Quran
                  </p>
                </div>
              </div>
              
              {/* Right: Quick Links */}
              <nav className="hidden sm:flex items-center gap-1">
                  <Link 
                    href="/chat" 
                    className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
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

      {/* Search Bar Section */}
      <div className="bg-white border-b border-stone-200 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <SearchBar placeholder="Cari ayat dalam Al-Quran..." className="max-w-xl" />
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-3xl mx-auto px-4 py-3" aria-label="Breadcrumb">
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
            Pencarian
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border border-stone-200 rounded-2xl bg-white">
                  <Skeleton className="h-5 w-24 mb-3 bg-stone-100" />
                  <Skeleton className="h-4 w-full mb-2 bg-stone-50" />
                  <Skeleton className="h-4 w-3/4 bg-stone-50" />
                </div>
              ))}
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </main>
    </div>
  );
}
