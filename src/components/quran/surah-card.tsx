"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Surah } from "@/lib/quran-data";
import { getRevelationType } from "@/lib/quran-data";

interface SurahCardProps {
  surah: Surah;
}

export function SurahCard({ surah }: SurahCardProps) {
  const isMakki = surah.revelation_place === "makkah";
  
  return (
    <Link href={`/quran/${surah.id}`}>
      <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-[#BADDFF]/20 hover:to-[#BAFFF5]/10 hover:border-[#496580]/30 transition-all duration-300 cursor-pointer">
        <div className="p-4 flex items-center gap-4">
          {/* Surah Number */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            isMakki 
              ? "bg-gradient-to-br from-[#FFDBBB]/50 to-[#FFDBBB]/20" 
              : "bg-gradient-to-br from-[#BAFFF5]/50 to-[#BAFFF5]/20"
          }`}>
            <span className="text-[#496580] font-bold text-lg">
              {surah.id}
            </span>
          </div>

          {/* Surah Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground group-hover:text-[#496580] transition-colors truncate">
                {surah.name_simple}
              </h3>
              <Badge
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 h-4 ${
                  isMakki 
                    ? "bg-[#FFDBBB]/30 text-[#496580] border-[#FFDBBB]/50" 
                    : "bg-[#BAFFF5]/30 text-[#496580] border-[#BAFFF5]/50"
                }`}
              >
                {getRevelationType(surah.revelation_place)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {surah.translated_name?.name || surah.name_simple}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {surah.verses_count} Ayat
            </p>
          </div>

          {/* Arabic Name */}
          <div className="flex-shrink-0 text-right">
            <p className="arabic-text text-2xl text-[#496580] dark:text-[#FFDBBB] group-hover:scale-105 transition-transform">
              {surah.name_arabic}
            </p>
          </div>
        </div>

        {/* Hover effect decoration */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#BADDFF]/20 to-transparent" />
        </div>
      </Card>
    </Link>
  );
}
