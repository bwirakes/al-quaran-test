"use client";

import Link from "next/link";
import type { Surah } from "@/lib/quran-data";
import { getRevelationType } from "@/lib/quran-data";
import { ArrowRight } from "lucide-react";

interface SurahCardProps {
  surah: Surah;
}

export function SurahCard({ surah }: SurahCardProps) {
  const isMakki = surah.revelation_place === "makkah";
  const revelationType = getRevelationType(surah.revelation_place);
  
  return (
    <article
      itemScope
      itemType="https://schema.org/Chapter"
      className="h-full"
    >
      <Link
        href={`/quran/${surah.id}`}
        title={`Baca Surah ${surah.name_simple} (${surah.name_arabic}) - ${surah.translated_name?.name} dengan terjemahan Indonesia`}
        aria-label={`Surah ${surah.name_simple}, ${surah.translated_name?.name}, ${surah.verses_count} ayat, ${revelationType}`}
        className="block group h-full"
      >
        {/* Clean White Card with Blue Arabic Text */}
        <div className="h-full p-4 border border-stone-200 rounded-xl bg-white hover:border-sky-300 hover:bg-sky-50/30 transition-colors">
          <div className="flex items-center gap-4">
            {/* Surah Number - Blue themed */}
            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center">
              <span
                className="font-bold text-sm"
                style={{ color: '#496580' }}
                itemProp="position"
              >
                {surah.id}
              </span>
            </div>

            {/* Surah Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3
                  className="font-medium text-slate-900 truncate text-sm group-hover:text-sky-700 transition-colors"
                  itemProp="name"
                >
                  {surah.name_simple}
                </h3>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isMakki
                      ? "bg-stone-100 text-slate-600"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {revelationType}
                </span>
              </div>
              <p
                className="text-xs text-slate-500 truncate"
                itemProp="alternateName"
              >
                {surah.translated_name?.name || surah.name_simple}
              </p>
              <p
                className="text-[10px] text-slate-400 mt-0.5"
                itemProp="numberOfPages"
              >
                {surah.verses_count} Ayat
              </p>
            </div>

            {/* Arabic Name - Blue Color #496580 */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <p
                className="text-xl"
                style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
                lang="ar"
                dir="rtl"
                itemProp="alternateName"
              >
                {surah.name_arabic}
              </p>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-sky-600 transition-colors" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </Link>
      {/* Hidden SEO content */}
      <meta itemProp="inLanguage" content="ar" />
      <link itemProp="url" href={`/quran/${surah.id}`} />
    </article>
  );
}
