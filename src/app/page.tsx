import Link from "next/link";
import Image from "next/image";
import { ActionCard } from "@/components/ui/action-card";
import { PrayerTimesSection } from "@/components/prayer/prayer-times-widget";
import { Footer } from "@/components/layout/footer";

// Homepage JSON-LD structured data
function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Al-Quran Digital Indonesia",
    alternateName: ["Quran Digital", "Al-Quran Online Indonesia"],
    description:
      "Baca Al-Quran online lengkap dengan terjemahan bahasa Indonesia. 114 surah, 6236 ayat dengan tafsir dan audio.",
    url: "https://quran.example.com",
    applicationCategory: "ReligiousApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    featureList: [
      "114 Surah Al-Quran lengkap",
      "Terjemahan Bahasa Indonesia dari Kemenag",
      "Pencarian ayat",
      "Asisten AI Islam",
      "Teks Arab dan Latin",
    ],
    softwareVersion: "1.0",
    author: {
      "@type": "Organization",
      name: "Al-Quran Digital Indonesia",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <div className="min-h-screen bg-white">
        {/* Floating Header Bar */}
        <header className="fixed top-4 left-4 right-4 z-50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left: Logo + Title */}
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-sky-200 rounded-lg flex items-center justify-center bg-sky-50">
                    <span className="font-bold text-sm" style={{ color: '#496580' }}>ق</span>
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight text-slate-900">
                      Al-Quran Digital
                    </h1>
                    <p 
                      className="text-xs -mt-0.5" 
                      lang="ar" 
                      dir="rtl"
                      style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
                    >
                      القرآن الكريم
                    </p>
                  </div>
                </Link>
                
                {/* Right: Quick Nav */}
                <nav className="hidden md:flex items-center gap-1">
                  <Link 
                    href="/quran" 
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    Daftar Surah
                  </Link>
                  <Link 
                    href="/quran/search" 
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    Cari Ayat
                  </Link>
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

        {/* Hero Section with Islamic Pattern Background */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-24 pb-12">
          {/* Background Image */}
          <Image
            src="/islamic-pattern.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Gradient Overlay - Minimal to show more of the pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/90" />
          
          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
            {/* Text container with frosted glass effect for legibility */}
            <div className="inline-block bg-white/70 backdrop-blur-sm rounded-2xl px-8 py-8 shadow-lg">
              <p 
                className="text-4xl md:text-5xl mb-5 font-medium drop-shadow-sm" 
                lang="ar" 
                dir="rtl"
                style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="text-slate-700 text-sm md:text-base font-medium">
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <main className="px-4 py-8 bg-white">
          {/* Prayer Times Widget */}
          <div className="max-w-3xl mx-auto w-full mb-8">
            <PrayerTimesSection />
          </div>
          
          {/* 2-Column Grid - Royal Blue Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
            {/* Read Quran Card */}
            <ActionCard
              variant="royal"
              href="/quran"
              icon="BookOpen"
              title="Baca Al-Quran"
              description="Jelajahi 114 surah dengan teks Arab dan terjemahan bahasa Indonesia dari Kemenag."
              tags={["114 Surah", "6236 Ayat"]}
              cta="Mulai membaca"
            />

            {/* AI Assistant Card */}
            <ActionCard
              variant="royal"
              href="/chat"
              icon="MessageCircle"
              title="Asisten Islam AI"
              description="Tanyakan tentang tafsir, hukum Islam, dan panduan ibadah dengan AI terpercaya."
              tags={["Berbasis AI", "Bahasa Indonesia"]}
              cta="Mulai bertanya"
            />
          </div>

          {/* Quick Links */}
          <div className="max-w-3xl mx-auto w-full mt-12">
            <p className="text-xs font-medium text-stone-400 mb-4 text-center uppercase tracking-widest">
              Surah Populer
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: 1, name: "Al-Fatihah" },
                { id: 36, name: "Yasin" },
                { id: 67, name: "Al-Mulk" },
                { id: 55, name: "Ar-Rahman" },
                { id: 18, name: "Al-Kahf" },
                { id: 112, name: "Al-Ikhlas" },
              ].map((surah) => (
                <Link 
                  key={surah.id} 
                  href={`/quran/${surah.id}`}
                  className="px-3 py-1.5 text-sm text-slate-600 border border-stone-200 rounded-md hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                >
                  {surah.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Verses */}
          <div className="max-w-3xl mx-auto w-full mt-10">
            <p className="text-xs font-medium text-stone-400 mb-4 text-center uppercase tracking-widest">
              Ayat Populer
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link 
                href="/quran/2/255" 
                className="p-3 border border-stone-200 rounded-lg bg-white hover:border-sky-300 hover:bg-sky-50 transition-colors text-center group"
              >
                <p className="font-medium text-sm text-slate-900 group-hover:text-sky-700 transition-colors">Ayatul Kursi</p>
                <p className="text-xs text-slate-400 mt-0.5">Al-Baqarah:255</p>
              </Link>
              <Link 
                href="/quran/2/286" 
                className="p-3 border border-stone-200 rounded-lg bg-white hover:border-sky-300 hover:bg-sky-50 transition-colors text-center group"
              >
                <p className="font-medium text-sm text-slate-900 group-hover:text-sky-700 transition-colors">Penutup Baqarah</p>
                <p className="text-xs text-slate-400 mt-0.5">Al-Baqarah:286</p>
              </Link>
              <Link 
                href="/quran/112/1" 
                className="p-3 border border-stone-200 rounded-lg bg-white hover:border-sky-300 hover:bg-sky-50 transition-colors text-center group"
              >
                <p className="font-medium text-sm text-slate-900 group-hover:text-sky-700 transition-colors">Al-Ikhlas</p>
                <p className="text-xs text-slate-400 mt-0.5">Surah 112</p>
              </Link>
              <Link 
                href="/quran/1/1" 
                className="p-3 border border-stone-200 rounded-lg bg-white hover:border-sky-300 hover:bg-sky-50 transition-colors text-center group"
              >
                <p className="font-medium text-sm text-slate-900 group-hover:text-sky-700 transition-colors">Al-Fatihah</p>
                <p className="text-xs text-slate-400 mt-0.5">Pembukaan</p>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
