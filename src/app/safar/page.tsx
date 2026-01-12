"use client";

/**
 * Safar (Journey Map) Page
 * 
 * Displays the 10 thematic islands and user progress.
 * Users can tap on islands to see the surahs within.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Map, Compass, Flame, Leaf, Droplets, Sun } from "lucide-react";
import { IslandCard } from "@/components/gamification/island-card";
import { useUserStore } from "@/stores/user-store";

// Static island data (in production, this would come from the API)
const ISLANDS = [
  { id: 1, nameId: "Fondasi Iman", nameAr: "أساس الإيمان", description: "Mulai perjalananmu dengan dasar-dasar keimanan", theme: "foundations", icon: "compass", color: "#496580", nodeCount: 5 },
  { id: 2, nameId: "Kisah Para Nabi", nameAr: "قصص الأنبياء", description: "Jelajahi kisah-kisah inspiratif para Nabi", theme: "prophets", icon: "book-open", color: "#496580", nodeCount: 10 },
  { id: 3, nameId: "Hukum & Syariat", nameAr: "الأحكام والشريعة", description: "Pelajari hukum-hukum Islam", theme: "laws", icon: "scale", color: "#496580", nodeCount: 8 },
  { id: 4, nameId: "Hari Akhir", nameAr: "اليوم الآخر", description: "Renungkan tentang hari kiamat", theme: "afterlife", icon: "sunrise", color: "#496580", nodeCount: 11 },
  { id: 5, nameId: "Ibadah & Ketaatan", nameAr: "العبادة والطاعة", description: "Dalami ayat-ayat tentang ibadah", theme: "worship", icon: "heart", color: "#496580", nodeCount: 8 },
  { id: 6, nameId: "Keluarga & Masyarakat", nameAr: "الأسرة والمجتمع", description: "Panduan kehidupan berkeluarga", theme: "family", icon: "users", color: "#496580", nodeCount: 5 },
  { id: 7, nameId: "Kesabaran & Ujian", nameAr: "الصبر والابتلاء", description: "Ayat-ayat tentang kesabaran", theme: "trials", icon: "shield", color: "#496580", nodeCount: 9 },
  { id: 8, nameId: "Tanda-tanda Alam", nameAr: "آيات الكون", description: "Kagumi kebesaran Allah di alam semesta", theme: "nature", icon: "globe", color: "#496580", nodeCount: 27 },
  { id: 9, nameId: "Dialog & Dakwah", nameAr: "الحوار والدعوة", description: "Pelajari cara berdialog dengan hikmah", theme: "dialogue", icon: "message-circle", color: "#496580", nodeCount: 16 },
  { id: 10, nameId: "Juz Amma", nameAr: "جزء عمّ", description: "Surah-surah pendek untuk pemula", theme: "short_surahs", icon: "star", color: "#496580", nodeCount: 14 },
];

export default function SafarPage() {
  const { user } = useUserStore();
  const [completedNodes, setCompletedNodes] = useState<Record<number, number>>({});

  // Simulate loading completed nodes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("quran-app-progress");
    if (stored) {
      try {
        setCompletedNodes(JSON.parse(stored));
      } catch {
        setCompletedNodes({});
      }
    }
  }, []);

  // Calculate total progress
  const totalNodes = ISLANDS.reduce((sum, island) => sum + island.nodeCount, 0);
  const totalCompleted = Object.values(completedNodes).reduce((sum, count) => sum + count, 0);
  const overallProgress = (totalCompleted / totalNodes) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Logo + Title */}
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 border border-sky-200 rounded-lg flex items-center justify-center bg-sky-50">
                  <Map className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-slate-900 font-serif">
                    Safar
                  </h1>
                  <p className="text-xs text-slate-500 -mt-0.5">
                    Perjalanan Quranmu
                  </p>
                </div>
              </Link>
              
              {/* Right: Resources */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 rounded-lg">
                  <Leaf className="w-4 h-4" style={{ color: '#496580' }} />
                  <span className="font-medium text-slate-700">{user.inventory.seeds}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 rounded-lg">
                  <Droplets className="w-4 h-4" style={{ color: '#496580' }} />
                  <span className="font-medium text-slate-700">{user.inventory.water}</span>
                </div>
                {user.streak.current > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 rounded-lg">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-slate-700">{user.streak.current}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Breadcrumb */}
      <nav className="max-w-3xl mx-auto px-4 py-3 border-b border-stone-100" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-slate-500">
          <li>
            <Link href="/" className="hover:text-sky-600 transition-colors">
              Beranda
            </Link>
          </li>
          <li className="text-stone-300">/</li>
          <li className="text-slate-900 font-medium" aria-current="page">
            Safar
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <section className="mb-8">
          <div className="border border-sky-200 rounded-2xl p-6 bg-sky-50/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Perjalanan Quranmu</h2>
                <p className="text-slate-600 text-sm">
                  {totalCompleted} dari {totalNodes} surah selesai
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Progress Keseluruhan</span>
                <span className="font-semibold" style={{ color: '#496580' }}>{Math.round(overallProgress)}%</span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden border border-sky-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%`, backgroundColor: '#496580' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Islands Grid */}
        <section aria-labelledby="islands">
          <div className="flex items-center gap-2 mb-6">
            <Compass className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
            <h2 id="islands" className="text-sm font-medium text-slate-900 uppercase tracking-wider">
              10 Pulau Tematik
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ISLANDS.map((island, index) => {
              // First island is always unlocked, others require previous to have some progress
              const isUnlocked = index === 0 || (completedNodes[island.id - 1] || 0) > 0 || index < 3;
              
              return (
                <IslandCard
                  key={island.id}
                  {...island}
                  orderIndex={island.id}
                  completedNodes={completedNodes[island.id] || 0}
                  isUnlocked={isUnlocked}
                />
              );
            })}
          </div>
        </section>

        {/* Motivation */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Terus membaca untuk membuka pulau berikutnya! 🌟
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-stone-200 p-2">
          <div className="grid grid-cols-3 gap-1">
            <Link href="/quran" className="flex flex-col items-center py-2 px-3 rounded-xl hover:bg-sky-50 transition-colors">
              <span className="text-xl mb-1">📖</span>
              <span className="text-xs text-slate-600">Baca</span>
            </Link>
            <Link href="/safar" className="flex flex-col items-center py-2 px-3 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-xl mb-1">🗺️</span>
              <span className="text-xs font-medium" style={{ color: '#496580' }}>Safar</span>
            </Link>
            <Link href="/kebun" className="flex flex-col items-center py-2 px-3 rounded-xl hover:bg-sky-50 transition-colors">
              <span className="text-xl mb-1">🌱</span>
              <span className="text-xs text-slate-600">Kebun</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-24" />
    </div>
  );
}
