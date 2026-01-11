"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-[#BADDFF]/10 hover:to-[#BAFFF5]/5 transition-all duration-300">
      <div className="p-6">
        {/* Verse Header */}
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-[#BADDFF]/30 to-[#BAFFF5]/30 border-[#496580]/20 text-[#496580] dark:text-[#FFDBBB] font-medium"
          >
            {surahNumber}:{verse.verse_number}
          </Badge>
        </div>

        {/* Arabic Text */}
        <div className="mb-6 pb-6 border-b border-border/30">
          <p className="arabic-text text-3xl leading-loose text-[#496580] dark:text-[#FFDBBB] text-right">
            {verse.text_uthmani}
          </p>
        </div>

        {/* Indonesian Translation */}
        {verse.translations && verse.translations.length > 0 && (
          <div>
            <p className="text-muted-foreground leading-relaxed text-base">
              {cleanTranslation(verse.translations[0].text)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
