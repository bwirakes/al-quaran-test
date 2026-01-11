"use client";

/**
 * Island Detail Page
 * 
 * Shows all surahs/nodes within a specific thematic island.
 * Users can track their progress and start reading.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Lock,
  Leaf,
  Droplets,
  Play,
  Star,
} from "lucide-react";
import { useUserStore } from "@/stores/user-store";

// Island data
const ISLANDS: Record<number, {
  id: number;
  nameId: string;
  nameAr: string;
  description: string;
  theme: string;
  color: string;
}> = {
  1: { id: 1, nameId: "Fondasi Iman", nameAr: "أساس الإيمان", description: "Mulai perjalananmu dengan dasar-dasar keimanan", theme: "foundations", color: "#496580" },
  2: { id: 2, nameId: "Kisah Para Nabi", nameAr: "قصص الأنبياء", description: "Jelajahi kisah-kisah inspiratif para Nabi", theme: "prophets", color: "#496580" },
  3: { id: 3, nameId: "Hukum & Syariat", nameAr: "الأحكام والشريعة", description: "Pelajari hukum-hukum Islam", theme: "laws", color: "#496580" },
  4: { id: 4, nameId: "Hari Akhir", nameAr: "اليوم الآخر", description: "Renungkan tentang hari kiamat", theme: "afterlife", color: "#496580" },
  5: { id: 5, nameId: "Ibadah & Ketaatan", nameAr: "العبادة والطاعة", description: "Dalami ayat-ayat tentang ibadah", theme: "worship", color: "#496580" },
  6: { id: 6, nameId: "Keluarga & Masyarakat", nameAr: "الأسرة والمجتمع", description: "Panduan kehidupan berkeluarga", theme: "family", color: "#496580" },
  7: { id: 7, nameId: "Kesabaran & Ujian", nameAr: "الصبر والابتلاء", description: "Ayat-ayat tentang kesabaran", theme: "trials", color: "#496580" },
  8: { id: 8, nameId: "Tanda-tanda Alam", nameAr: "آيات الكون", description: "Kagumi kebesaran Allah di alam semesta", theme: "nature", color: "#496580" },
  9: { id: 9, nameId: "Dialog & Dakwah", nameAr: "الحوار والدعوة", description: "Pelajari cara berdialog dengan hikmah", theme: "dialogue", color: "#496580" },
  10: { id: 10, nameId: "Juz Amma", nameAr: "جزء عمّ", description: "Surah-surah pendek untuk pemula", theme: "short_surahs", color: "#496580" },
};

// Node data per island (simplified - in production this would come from API)
const ISLAND_NODES: Record<number, Array<{
  id: string;
  name: string;
  nameAr: string;
  surahId: number;
  description: string;
  xpReward: number;
  seedReward: number;
  estimatedMinutes: number;
}>> = {
  1: [
    { id: "n1", name: "Al-Fatihah", nameAr: "الفاتحة", surahId: 1, description: "Pembukaan - Fondasi semua doa", xpReward: 20, seedReward: 5, estimatedMinutes: 2 },
    { id: "n2", name: "Al-Ikhlas", nameAr: "الإخلاص", surahId: 112, description: "Kemurnian tauhid", xpReward: 15, seedReward: 4, estimatedMinutes: 1 },
    { id: "n3", name: "Al-Kafirun", nameAr: "الكافرون", surahId: 109, description: "Deklarasi keimanan", xpReward: 15, seedReward: 4, estimatedMinutes: 1 },
    { id: "n4", name: "Al-Baqarah", nameAr: "البقرة", surahId: 2, description: "Panduan komprehensif keimanan", xpReward: 500, seedReward: 100, estimatedMinutes: 120 },
    { id: "n5", name: "Ali Imran", nameAr: "آل عمران", surahId: 3, description: "Keluarga Imran - Iman dan keteguhan", xpReward: 350, seedReward: 70, estimatedMinutes: 80 },
  ],
  2: [
    { id: "n6", name: "Yusuf", nameAr: "يوسف", surahId: 12, description: "Kisah indah Nabi Yusuf", xpReward: 200, seedReward: 40, estimatedMinutes: 45 },
    { id: "n7", name: "Maryam", nameAr: "مريم", surahId: 19, description: "Kisah Maryam, Isa, dan Ibrahim", xpReward: 150, seedReward: 30, estimatedMinutes: 35 },
    { id: "n8", name: "Al-Anbiya", nameAr: "الأنبياء", surahId: 21, description: "Kisah para Nabi", xpReward: 180, seedReward: 36, estimatedMinutes: 40 },
    { id: "n9", name: "Al-Qasas", nameAr: "القصص", surahId: 28, description: "Kisah Musa secara detail", xpReward: 170, seedReward: 34, estimatedMinutes: 40 },
    { id: "n10", name: "Hud", nameAr: "هود", surahId: 11, description: "Kisah Hud, Salih, Lut", xpReward: 200, seedReward: 40, estimatedMinutes: 45 },
  ],
  3: [
    { id: "n11", name: "An-Nisa", nameAr: "النساء", surahId: 4, description: "Hukum wanita dan keluarga", xpReward: 350, seedReward: 70, estimatedMinutes: 80 },
    { id: "n12", name: "Al-Maidah", nameAr: "المائدة", surahId: 5, description: "Kontrak dan hukum makanan", xpReward: 280, seedReward: 56, estimatedMinutes: 60 },
    { id: "n13", name: "Al-Anfal", nameAr: "الأنفال", surahId: 8, description: "Hukum perang", xpReward: 140, seedReward: 28, estimatedMinutes: 30 },
    { id: "n14", name: "At-Tawbah", nameAr: "التوبة", surahId: 9, description: "Perjanjian dan taubat", xpReward: 250, seedReward: 50, estimatedMinutes: 55 },
  ],
  4: [
    { id: "n15", name: "Al-Waqi'ah", nameAr: "الواقعة", surahId: 56, description: "Hari Kiamat", xpReward: 80, seedReward: 16, estimatedMinutes: 15 },
    { id: "n16", name: "Ar-Rahman", nameAr: "الرحمن", surahId: 55, description: "Nikmat Allah dan surga", xpReward: 75, seedReward: 15, estimatedMinutes: 15 },
    { id: "n17", name: "Al-Mulk", nameAr: "الملك", surahId: 67, description: "Kerajaan Allah", xpReward: 50, seedReward: 10, estimatedMinutes: 10 },
    { id: "n18", name: "Al-Qiyamah", nameAr: "القيامة", surahId: 75, description: "Hari Kebangkitan", xpReward: 40, seedReward: 8, estimatedMinutes: 8 },
  ],
  5: [
    { id: "n19", name: "Al-Hajj", nameAr: "الحج", surahId: 22, description: "Ibadah haji", xpReward: 140, seedReward: 28, estimatedMinutes: 30 },
    { id: "n20", name: "Al-Jumu'ah", nameAr: "الجمعة", surahId: 62, description: "Shalat Jumat", xpReward: 25, seedReward: 5, estimatedMinutes: 5 },
    { id: "n21", name: "Al-Muzzammil", nameAr: "المزمل", surahId: 73, description: "Shalat malam", xpReward: 35, seedReward: 7, estimatedMinutes: 7 },
  ],
  6: [
    { id: "n22", name: "At-Talaq", nameAr: "الطلاق", surahId: 65, description: "Hukum perceraian", xpReward: 30, seedReward: 6, estimatedMinutes: 6 },
    { id: "n23", name: "Luqman", nameAr: "لقمان", surahId: 31, description: "Hikmah mendidik anak", xpReward: 60, seedReward: 12, estimatedMinutes: 12 },
    { id: "n24", name: "Al-Isra", nameAr: "الإسراء", surahId: 17, description: "Perjalanan malam dan tugas sosial", xpReward: 180, seedReward: 36, estimatedMinutes: 40 },
  ],
  7: [
    { id: "n25", name: "Al-Ankabut", nameAr: "العنكبوت", surahId: 29, description: "Ujian keimanan", xpReward: 120, seedReward: 24, estimatedMinutes: 25 },
    { id: "n26", name: "Muhammad", nameAr: "محمد", surahId: 47, description: "Perjuangan dan keteguhan", xpReward: 70, seedReward: 14, estimatedMinutes: 15 },
    { id: "n27", name: "Al-Fath", nameAr: "الفتح", surahId: 48, description: "Kemenangan", xpReward: 55, seedReward: 11, estimatedMinutes: 12 },
    { id: "n28", name: "Al-Asr", nameAr: "العصر", surahId: 103, description: "Waktu dan kesabaran", xpReward: 10, seedReward: 2, estimatedMinutes: 1 },
  ],
  8: [
    { id: "n29", name: "Al-An'am", nameAr: "الأنعام", surahId: 6, description: "Tanda-tanda di alam", xpReward: 280, seedReward: 56, estimatedMinutes: 60 },
    { id: "n30", name: "Al-A'raf", nameAr: "الأعراف", surahId: 7, description: "Penciptaan dan sejarah", xpReward: 350, seedReward: 70, estimatedMinutes: 80 },
    { id: "n31", name: "Ar-Ra'd", nameAr: "الرعد", surahId: 13, description: "Petir - tanda di alam", xpReward: 90, seedReward: 18, estimatedMinutes: 20 },
    { id: "n32", name: "Ya-Sin", nameAr: "يس", surahId: 36, description: "Jantung Al-Quran", xpReward: 140, seedReward: 28, estimatedMinutes: 30 },
  ],
  9: [
    { id: "n33", name: "Al-Hijr", nameAr: "الحجر", surahId: 15, description: "Peringatan pada orang kafir", xpReward: 150, seedReward: 30, estimatedMinutes: 35 },
    { id: "n34", name: "Al-Mu'minun", nameAr: "المؤمنون", surahId: 23, description: "Karakteristik orang beriman", xpReward: 180, seedReward: 36, estimatedMinutes: 40 },
    { id: "n35", name: "Qaf", nameAr: "ق", surahId: 50, description: "Argumen kebangkitan", xpReward: 80, seedReward: 16, estimatedMinutes: 18 },
  ],
  10: [
    { id: "n36", name: "An-Naba", nameAr: "النبأ", surahId: 78, description: "Berita besar", xpReward: 40, seedReward: 8, estimatedMinutes: 8 },
    { id: "n37", name: "An-Nazi'at", nameAr: "النازعات", surahId: 79, description: "Malaikat pencabut nyawa", xpReward: 45, seedReward: 9, estimatedMinutes: 9 },
    { id: "n38", name: "Al-Alaq", nameAr: "العلق", surahId: 96, description: "Wahyu pertama", xpReward: 25, seedReward: 5, estimatedMinutes: 5 },
    { id: "n39", name: "Al-Qadr", nameAr: "القدر", surahId: 97, description: "Malam kemuliaan", xpReward: 15, seedReward: 3, estimatedMinutes: 2 },
    { id: "n40", name: "Al-Falaq", nameAr: "الفلق", surahId: 113, description: "Perlindungan dari kejahatan", xpReward: 10, seedReward: 2, estimatedMinutes: 1 },
    { id: "n41", name: "An-Nas", nameAr: "الناس", surahId: 114, description: "Perlindungan dari bisikan", xpReward: 10, seedReward: 2, estimatedMinutes: 1 },
  ],
};

interface NodeProgress {
  status: "locked" | "unlocked" | "in_progress" | "completed";
  progressPercent: number;
}

export default function IslandDetailPage() {
  const params = useParams();
  const islandId = parseInt(params.islandId as string, 10);
  const { user } = useUserStore();
  
  const [nodeProgress, setNodeProgress] = useState<Record<string, NodeProgress>>({});

  const island = ISLANDS[islandId];
  const nodes = ISLAND_NODES[islandId] || [];

  // Load progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`quran-app-island-${islandId}-progress`);
    if (stored) {
      try {
        setNodeProgress(JSON.parse(stored));
      } catch {
        // Initialize with first node unlocked
        const initial: Record<string, NodeProgress> = {};
        nodes.forEach((node, index) => {
          initial[node.id] = {
            status: index === 0 ? "unlocked" : "locked",
            progressPercent: 0,
          };
        });
        setNodeProgress(initial);
      }
    } else {
      // Initialize with first node unlocked
      const initial: Record<string, NodeProgress> = {};
      nodes.forEach((node, index) => {
        initial[node.id] = {
          status: index === 0 ? "unlocked" : "locked",
          progressPercent: 0,
        };
      });
      setNodeProgress(initial);
    }
  }, [islandId, nodes]);

  if (!island) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Pulau tidak ditemukan</p>
          <Link href="/safar" className="text-sky-600 hover:underline">
            Kembali ke Safar
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = Object.values(nodeProgress).filter(
    (p) => p.status === "completed"
  ).length;
  const totalXP = nodes.reduce((sum, n) => sum + n.xpReward, 0);
  const totalSeeds = nodes.reduce((sum, n) => sum + n.seedReward, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back + Island Info */}
              <div className="flex items-center gap-3">
                <Link href="/safar">
                  <button className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                </Link>
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#496580' }}
                >
                  {islandId}
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-slate-900 font-serif">
                    {island.nameId}
                  </h1>
                  <p className="text-xs text-slate-500 -mt-0.5">
                    {completedCount}/{nodes.length} selesai
                  </p>
                </div>
              </div>
              
              {/* Right: Resources */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 rounded-lg">
                  <Leaf className="w-4 h-4" style={{ color: '#496580' }} />
                  <span className="font-medium text-slate-700">{user.inventory.seeds}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 rounded-lg">
                  <Droplets className="w-4 h-4" style={{ color: '#496580' }} />
                  <span className="font-medium text-slate-700">{user.inventory.water}</span>
                </div>
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
          <li>
            <Link href="/safar" className="hover:text-sky-600 transition-colors">
              Safar
            </Link>
          </li>
          <li className="text-stone-300">/</li>
          <li className="text-slate-900 font-medium" aria-current="page">
            {island.nameId}
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Island Header */}
        <section className="mb-8">
          <div className="border border-sky-200 rounded-2xl p-6 bg-sky-50/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{island.nameId}</h2>
                <p 
                  className="text-lg mb-2"
                  style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
                  lang="ar"
                  dir="rtl"
                >
                  {island.nameAr}
                </p>
                <p className="text-slate-600 text-sm">{island.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                  <Star className="w-4 h-4" style={{ color: '#496580' }} />
                  <span>{totalXP} XP</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Leaf className="w-4 h-4" style={{ color: '#496580' }} />
                  <span>{totalSeeds} Benih</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold" style={{ color: '#496580' }}>
                  {Math.round((completedCount / nodes.length) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden border border-sky-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(completedCount / nodes.length) * 100}%`, 
                    backgroundColor: '#496580' 
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Node List */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
              Daftar Surah
            </h3>
            <span className="text-xs px-2 py-0.5 bg-stone-100 rounded-md text-slate-600">
              {nodes.length}
            </span>
          </div>

          <div className="space-y-3">
            {nodes.map((node, index) => {
              const progress = nodeProgress[node.id] || { status: "locked", progressPercent: 0 };
              const isLocked = progress.status === "locked";
              const isCompleted = progress.status === "completed";
              const isInProgress = progress.status === "in_progress";

              return (
                <div
                  key={node.id}
                  className={`
                    relative rounded-xl border p-4 transition-all
                    ${isLocked 
                      ? "bg-slate-50 border-slate-200 opacity-60" 
                      : isCompleted
                        ? "bg-white border-sky-200"
                        : "bg-white border-stone-200 hover:border-sky-300 hover:bg-sky-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Order/Status */}
                    <div 
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isCompleted ? "bg-sky-100" : isLocked ? "bg-slate-200" : "bg-sky-50 border border-sky-200"}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: '#496580' }} />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 text-slate-400" />
                      ) : (
                        <span className="font-bold" style={{ color: '#496580' }}>{index + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{node.name}</h4>
                        <span 
                          className="text-sm"
                          style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
                          lang="ar"
                        >
                          {node.nameAr}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{node.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {node.estimatedMinutes} menit
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {node.xpReward} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          {node.seedReward}
                        </span>
                      </div>

                      {/* Progress bar for in-progress */}
                      {isInProgress && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ 
                                width: `${progress.progressPercent}%`, 
                                backgroundColor: '#496580' 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    {!isLocked && (
                      <Link href={`/quran/${node.surahId}`}>
                        <button 
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                            ${isCompleted 
                              ? "bg-sky-50 text-[#496580] hover:bg-sky-100" 
                              : "text-white hover:opacity-90"
                            }
                          `}
                          style={!isCompleted ? { backgroundColor: '#496580' } : undefined}
                        >
                          {isCompleted ? (
                            <>Baca lagi</>
                          ) : isInProgress ? (
                            <>Lanjutkan</>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Mulai
                            </>
                          )}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
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
