"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Verse } from "@/lib/quran-data";

interface VerseCardProps {
  verse: Verse;
  surahNumber: number;
}

export function VerseCard({ verse, surahNumber }: VerseCardProps) {
  // Clean HTML tags from translation text
  const cleanTranslation = (text: string) => {
    return text.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"');
  };

  return (
    <article
      id={`ayat-${verse.verse_number}`}
      itemScope
      itemType="https://schema.org/Article"
    >
      {/* Clean White Card with Blue Arabic Text */}
      <div className="border border-stone-200 rounded-xl bg-white hover:border-sky-300 transition-colors">
        <div className="p-6">
          {/* Verse Header */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/quran/${surahNumber}/${verse.verse_number}`}
              className="group"
              title={`Baca Surah ${surahNumber} Ayat ${verse.verse_number} selengkapnya`}
            >
              <span
                className="text-xs font-medium px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-md group-hover:bg-sky-100 transition-colors"
                style={{ color: '#496580' }}
                itemProp="position"
              >
                {surahNumber}:{verse.verse_number}
              </span>
            </Link>
          </div>

          {/* Arabic Text - Blue Color #496580 */}
          <div className="mb-6 pb-6 border-b border-stone-100">
            <p
              className="text-3xl leading-loose text-right"
              style={{ 
                fontFamily: '"Scheherazade New", serif', 
                lineHeight: 2.2,
                color: '#496580'
              }}
              dir="rtl"
              lang="ar"
              itemProp="text"
            >
              {verse.text_uthmani}
            </p>
          </div>

          {/* Indonesian Translation */}
          {verse.translations && verse.translations.length > 0 && (
            <div>
              <p
                className="text-slate-600 leading-relaxed text-sm"
                lang="id"
                itemProp="description"
              >
                {cleanTranslation(verse.translations[0].text)}
              </p>
            </div>
          )}

          {/* SEO Link to verse page */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <Link
              href={`/quran/${surahNumber}/${verse.verse_number}`}
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-sky-600 transition-colors"
            >
              <span>Baca Ayat {verse.verse_number} selengkapnya</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
