import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, MessageCircle, Star, Heart, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <div className="min-h-screen">
        {/* Hero Section */}
        <header className="container mx-auto px-4 pt-16 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo/Icon */}
            <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#FFDBBB] to-[#BADDFF] flex items-center justify-center shadow-xl shadow-[#496580]/20">
              <div className="relative">
                <Star className="w-14 h-14 text-[#496580]" fill="#496580" />
                <Sparkles className="w-6 h-6 text-[#496580] absolute -top-1 -right-1" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Al-Quran Digital</span>
          </h1>
            <p className="arabic-text text-3xl text-[#496580] dark:text-[#FFDBBB] mb-6">
              القرآن الكريم
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Baca Al-Quran dengan terjemahan bahasa Indonesia dan dapatkan
              panduan Islam dari asisten AI yang terpercaya
          </p>
        </div>
        </header>

        {/* Main Features */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Quran Reader Card */}
            <Link href="/quran" className="block group">
              <Card className="h-full p-8 bg-gradient-to-br from-[#BADDFF]/30 to-[#BAFFF5]/20 border-[#BADDFF]/50 hover:border-[#496580]/50 hover:shadow-xl hover:shadow-[#BADDFF]/20 transition-all duration-500 cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#BADDFF]/30 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#BADDFF] to-[#BAFFF5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <BookOpen className="w-8 h-8 text-[#496580]" />
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-[#496580] transition-colors">
                    Baca Al-Quran
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Jelajahi 114 surah dengan teks Arab, terjemahan bahasa
                    Indonesia dari Kementerian Agama, dan fitur pencarian
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#BADDFF]/50 text-[#496580]">
                      114 Surah
                    </span>
                    <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#BAFFF5]/50 text-[#496580]">
                      6236 Ayat
                    </span>
                    <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#FFDBBB]/50 text-[#496580]">
                      Terjemahan Indonesia
                    </span>
                  </div>
                </div>
              </Card>
            </Link>

            {/* AI Chat Card */}
            <Link href="/chat" className="block group">
              <Card className="h-full p-8 bg-gradient-to-br from-[#FFDBBB]/30 to-[#BADDFF]/20 border-[#FFDBBB]/50 hover:border-[#496580]/50 hover:shadow-xl hover:shadow-[#FFDBBB]/20 transition-all duration-500 cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#FFDBBB]/30 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFDBBB] to-[#BADDFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <MessageCircle className="w-8 h-8 text-[#496580]" />
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-[#496580] transition-colors">
                    Asisten Islam AI
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Tanyakan tentang tafsir, hukum Islam, panduan ibadah, dan
                    berbagai pertanyaan seputar ajaran Islam
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#FFDBBB]/50 text-[#496580]">
                      Berbasis AI
                    </span>
                    <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#BADDFF]/50 text-[#496580]">
                      Bahasa Indonesia
                    </span>
                    <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#BAFFF5]/50 text-[#496580]">
                      24/7 Tersedia
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="text-sm font-semibold text-muted-foreground mb-6 text-center uppercase tracking-wider">
              Surah Populer
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { id: 1, name: "Al-Fatihah" },
                { id: 36, name: "Yasin" },
                { id: 67, name: "Al-Mulk" },
                { id: 55, name: "Ar-Rahman" },
                { id: 18, name: "Al-Kahf" },
                { id: 112, name: "Al-Ikhlas" },
              ].map((surah) => (
                <Link key={surah.id} href={`/quran/${surah.id}`}>
                  <Button
                    variant="outline"
                    className="bg-card/80 border-border hover:bg-[#BADDFF]/30 hover:border-[#496580]/30 hover:text-[#496580] transition-all"
                  >
                    {surah.name}
                  </Button>
                </Link>
              ))}
            </div>
        </div>
      </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 mt-12 border-t border-border/50">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Dibuat dengan <Heart className="w-4 h-4 inline text-[#FFDBBB]" fill="#FFDBBB" /> untuk
              umat Islam Indonesia
            </p>
            <p className="text-xs text-muted-foreground/70">
              Data Al-Quran dari Quran.com API • Terjemahan Kementerian Agama RI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
