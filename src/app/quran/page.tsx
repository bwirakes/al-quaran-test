import { Suspense } from "react";
import Link from "next/link";
import { getAllSurahs } from "@/lib/quran-data";
import { SurahCard } from "@/components/quran/surah-card";
import { SearchBar } from "@/components/quran/search-bar";
import { SurahListSkeleton } from "@/components/quran/surah-list-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

async function SurahList() {
  const surahs = await getAllSurahs();

  if (!surahs || surahs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Gagal memuat daftar surah. Silakan coba lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {surahs.map((surah) => (
        <SurahCard key={surah.id} surah={surah} />
      ))}
    </div>
  );
}

export default function QuranPage() {
  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="hover:bg-[#BADDFF]/30">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BADDFF] to-[#BAFFF5] flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-[#496580]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">Al-Quran</h1>
                    <p className="text-xs text-muted-foreground">
                      114 Surah • Terjemahan Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <SearchBar placeholder="Cari nama surah..." className="max-w-xl" />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Suspense fallback={<SurahListSkeleton />}>
            <SurahList />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
