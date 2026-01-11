import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurah, getVerses } from "@/lib/quran-data";
import { VerseCard } from "@/components/quran/verse-card";
import { VerseSkeleton } from "@/components/quran/surah-list-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getRevelationType } from "@/lib/quran-data";

interface SurahPageProps {
  params: Promise<{ surah: string }>;
}

async function VerseList({ surahNumber }: { surahNumber: number }) {
  const { verses } = await getVerses(surahNumber, 1, 286);

  if (!verses || verses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
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
    <div className="min-h-screen bg-background islamic-pattern">
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/quran">
                  <Button variant="ghost" size="icon" className="hover:bg-[#BADDFF]/30">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isMakki 
                      ? "bg-gradient-to-br from-[#FFDBBB] to-[#FFDBBB]/50" 
                      : "bg-gradient-to-br from-[#BAFFF5] to-[#BAFFF5]/50"
                  }`}>
                    <span className="text-[#496580] font-bold">{surah.id}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-bold text-foreground">
                        {surah.name_simple}
                      </h1>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 h-4 ${
                          isMakki 
                            ? "bg-[#FFDBBB]/30 text-[#496580]" 
                            : "bg-[#BAFFF5]/30 text-[#496580]"
                        }`}
                      >
                        {getRevelationType(surah.revelation_place)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {surah.translated_name?.name} • {surah.verses_count} Ayat
                    </p>
                  </div>
                </div>
              </div>
              <p className="arabic-text text-2xl text-[#496580] dark:text-[#FFDBBB] hidden sm:block">
                {surah.name_arabic}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Bismillah - except for Surah At-Tawbah (9) */}
          {surah.bismillah_pre && (
            <div className="text-center py-8 mb-6 bg-gradient-to-r from-[#BADDFF]/10 via-[#BAFFF5]/10 to-[#FFDBBB]/10 rounded-2xl">
              <p className="arabic-text text-3xl text-[#496580] dark:text-[#FFDBBB]">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
              </p>
            </div>
          )}

          {/* Verses */}
          <Suspense fallback={<VerseSkeleton />}>
            <VerseList surahNumber={surahNumber} />
          </Suspense>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
            {surahNumber > 1 ? (
              <Link href={`/quran/${surahNumber - 1}`}>
                <Button variant="outline" className="gap-2 hover:bg-[#BADDFF]/20 hover:border-[#496580]/30">
                  <ChevronLeft className="h-4 w-4" />
                  Surah Sebelumnya
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {surahNumber < 114 ? (
              <Link href={`/quran/${surahNumber + 1}`}>
                <Button variant="outline" className="gap-2 hover:bg-[#BADDFF]/20 hover:border-[#496580]/30">
                  Surah Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surah: (i + 1).toString(),
  }));
}
