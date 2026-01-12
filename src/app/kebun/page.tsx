"use client";

/**
 * Kebun (Garden) Page
 * 
 * Virtual garden where users can grow plants using
 * resources earned from reading and prayers.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flower2, Droplets, Leaf, Sun, Info, Flame } from "lucide-react";
import { GardenGrid, PlantSelector } from "@/components/gamification/garden-grid";
import { useUserStore } from "@/stores/user-store";

// Plant types data
const PLANT_TYPES = [
  { id: 1, name: "Date Palm Seedling", nameId: "Bibit Kurma", rarity: "common" as const, seedsRequired: 10, waterToBloom: 8, icon: "palm" },
  { id: 2, name: "Jasmine", nameId: "Melati", rarity: "common" as const, seedsRequired: 15, waterToBloom: 10, icon: "flower" },
  { id: 3, name: "Olive Sapling", nameId: "Bibit Zaitun", rarity: "common" as const, seedsRequired: 20, waterToBloom: 12, icon: "leaf" },
  { id: 4, name: "Rose of Jannah", nameId: "Mawar Jannah", rarity: "uncommon" as const, seedsRequired: 35, waterToBloom: 15, icon: "rose" },
  { id: 5, name: "Pomegranate Tree", nameId: "Pohon Delima", rarity: "uncommon" as const, seedsRequired: 40, waterToBloom: 18, icon: "fruit" },
  { id: 6, name: "Fig Tree", nameId: "Pohon Tin", rarity: "uncommon" as const, seedsRequired: 45, waterToBloom: 20, icon: "tree" },
  { id: 7, name: "Sidrah Tree", nameId: "Pohon Sidrah", rarity: "rare" as const, seedsRequired: 80, waterToBloom: 25, icon: "tree-pine" },
  { id: 8, name: "Kawthar Lily", nameId: "Lili Kautsar", rarity: "rare" as const, seedsRequired: 100, waterToBloom: 30, icon: "sparkles" },
  { id: 9, name: "Tuba Tree", nameId: "Pohon Tuba", rarity: "legendary" as const, seedsRequired: 200, waterToBloom: 50, icon: "crown" },
  { id: 10, name: "Garden of Firdaus", nameId: "Taman Firdaus", rarity: "legendary" as const, seedsRequired: 500, waterToBloom: 80, icon: "castle" },
];

interface GardenPlant {
  id: string;
  state: "planted" | "sprouting" | "blooming" | "withered";
  name: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  waterReceived: number;
  waterNeeded: number;
}

export default function KebunPage() {
  const { user, updateInventory } = useUserStore();
  const [plants, setPlants] = useState<(GardenPlant | null)[]>(Array(25).fill(null));
  const [showPlantSelector, setShowPlantSelector] = useState(false);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);

  // Load garden from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("quran-app-garden");
    if (stored) {
      try {
        setPlants(JSON.parse(stored));
      } catch {
        setPlants(Array(25).fill(null));
      }
    }
  }, []);

  // Save garden to localStorage
  useEffect(() => {
    localStorage.setItem("quran-app-garden", JSON.stringify(plants));
  }, [plants]);

  const handlePlantCell = (index: number) => {
    setSelectedCellIndex(index);
    setShowPlantSelector(true);
  };

  const handleSelectPlant = (plantTypeId: number) => {
    if (selectedCellIndex === null) return;

    const plantType = PLANT_TYPES.find((p) => p.id === plantTypeId);
    if (!plantType) return;

    // Check if user has enough seeds
    if (user.inventory.seeds < plantType.seedsRequired) return;

    // Deduct seeds
    updateInventory({ seeds: -plantType.seedsRequired });

    // Create new plant
    const newPlant: GardenPlant = {
      id: `plant-${Date.now()}`,
      state: "planted",
      name: plantType.nameId,
      icon: plantType.icon,
      rarity: plantType.rarity,
      waterReceived: 0,
      waterNeeded: plantType.waterToBloom,
    };

    // Add to grid
    const newPlants = [...plants];
    newPlants[selectedCellIndex] = newPlant;
    setPlants(newPlants);

    // Close selector
    setShowPlantSelector(false);
    setSelectedCellIndex(null);
  };

  const handleWaterPlant = (plantId: string) => {
    // Check if user has water
    if (user.inventory.water < 1) return;

    // Deduct water
    updateInventory({ water: -1 });

    // Update plant
    setPlants((prev) =>
      prev.map((plant) => {
        if (!plant || plant.id !== plantId) return plant;

        const newWaterReceived = plant.waterReceived + 1;
        const waterToSprout = Math.floor(plant.waterNeeded * 0.3);
        
        let newState = plant.state;
        if (plant.state === "planted" && newWaterReceived >= waterToSprout) {
          newState = "sprouting";
        } else if (plant.state === "sprouting" && newWaterReceived >= plant.waterNeeded) {
          newState = "blooming";
        } else if (plant.state === "withered" && newWaterReceived >= waterToSprout) {
          newState = "sprouting";
        }

        return {
          ...plant,
          waterReceived: newWaterReceived,
          state: newState,
        };
      })
    );
  };

  // Count plants by state
  const plantCounts = plants.reduce(
    (acc, plant) => {
      if (!plant) return acc;
      acc[plant.state] = (acc[plant.state] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
                  <Flower2 className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-slate-900 font-serif">
                    Kebun
                  </h1>
                  <p className="text-xs text-slate-500 -mt-0.5">
                    Kebun Virtualmu
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
                <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 rounded-lg">
                  <Sun className="w-4 h-4" style={{ color: '#496580' }} />
                  <span className="font-medium text-slate-700">{user.inventory.sunlight}</span>
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
          <li className="text-slate-900 font-medium" aria-current="page">
            Kebun
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Resource Bar */}
        <section className="mb-8">
          <div className="border border-sky-200 rounded-2xl p-6 bg-sky-50/50">
            {/* Level and XP */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: '#496580' }}
                >
                  {user.level}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Level</p>
                  <p className="text-sm font-semibold text-slate-800">{user.totalXp.toLocaleString("id-ID")} XP</p>
                </div>
              </div>
              {user.streak.current > 0 && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-sky-200">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-slate-700">{user.streak.current} hari</span>
                </div>
              )}
            </div>

            {/* XP Progress Bar */}
            <div className="mb-5">
              <div className="h-2 bg-white rounded-full overflow-hidden border border-sky-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(((user.totalXp % 100) / 100) * 100, 100)}%`,
                    backgroundColor: '#496580'
                  }}
                />
              </div>
            </div>

            {/* Resources */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 text-center border border-sky-200">
                <Leaf className="w-5 h-5 mx-auto mb-1" style={{ color: '#496580' }} />
                <p className="font-bold text-lg text-slate-900">{user.inventory.seeds}</p>
                <p className="text-xs text-slate-500">Benih</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-sky-200">
                <Droplets className="w-5 h-5 mx-auto mb-1" style={{ color: '#496580' }} />
                <p className="font-bold text-lg text-slate-900">{user.inventory.water}</p>
                <p className="text-xs text-slate-500">Air</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-sky-200">
                <Sun className="w-5 h-5 mx-auto mb-1" style={{ color: '#496580' }} />
                <p className="font-bold text-lg text-slate-900">{user.inventory.sunlight}</p>
                <p className="text-xs text-slate-500">Cahaya</p>
              </div>
            </div>
          </div>
        </section>

        {/* Garden Stats */}
        <section className="mb-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-stone-200">
              <span className="text-xl">🌱</span>
              <p className="font-bold text-lg text-slate-900">{plantCounts["planted"] || 0}</p>
              <p className="text-xs text-slate-500">Ditanam</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-stone-200">
              <span className="text-xl">🪴</span>
              <p className="font-bold text-lg text-slate-900">{plantCounts["sprouting"] || 0}</p>
              <p className="text-xs text-slate-500">Tumbuh</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-stone-200">
              <span className="text-xl">🌸</span>
              <p className="font-bold text-lg text-slate-900">{plantCounts["blooming"] || 0}</p>
              <p className="text-xs text-slate-500">Mekar</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-stone-200">
              <span className="text-xl">🥀</span>
              <p className="font-bold text-lg text-slate-900">{plantCounts["withered"] || 0}</p>
              <p className="text-xs text-slate-500">Layu</p>
            </div>
          </div>
        </section>

        {/* Garden Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flower2 className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
              <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
                Kebunmu (5×5)
              </h2>
            </div>
            <button className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <Info className="w-4 h-4" />
              Bantuan
            </button>
          </div>
          <GardenGrid
            plants={plants}
            gridSize={5}
            onPlant={handlePlantCell}
            onWater={handleWaterPlant}
            waterAvailable={user.inventory.water}
          />
        </section>

        {/* How to Play */}
        <section>
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Cara Bermain
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4" style={{ color: '#496580' }} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Dapatkan Benih</p>
                  <p>Baca Al-Quran untuk mendapatkan benih. 10 ayat = 1 benih.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center flex-shrink-0">
                  <Droplets className="w-4 h-4" style={{ color: '#496580' }} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Dapatkan Air</p>
                  <p>Check-in harian dan konfirmasi shalat untuk mendapatkan air.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center flex-shrink-0">
                  <Sun className="w-4 h-4" style={{ color: '#496580' }} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Dapatkan Cahaya</p>
                  <p>Bagikan ayat atau progress untuk mendapatkan cahaya matahari.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Plant Selector Modal */}
      <PlantSelector
        isOpen={showPlantSelector}
        onClose={() => {
          setShowPlantSelector(false);
          setSelectedCellIndex(null);
        }}
        onSelect={handleSelectPlant}
        availableSeeds={user.inventory.seeds}
        plantTypes={PLANT_TYPES}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-stone-200 p-2">
          <div className="grid grid-cols-3 gap-1">
            <Link href="/quran" className="flex flex-col items-center py-2 px-3 rounded-xl hover:bg-sky-50 transition-colors">
              <span className="text-xl mb-1">📖</span>
              <span className="text-xs text-slate-600">Baca</span>
            </Link>
            <Link href="/safar" className="flex flex-col items-center py-2 px-3 rounded-xl hover:bg-sky-50 transition-colors">
              <span className="text-xl mb-1">🗺️</span>
              <span className="text-xs text-slate-600">Safar</span>
            </Link>
            <Link href="/kebun" className="flex flex-col items-center py-2 px-3 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-xl mb-1">🌱</span>
              <span className="text-xs font-medium" style={{ color: '#496580' }}>Kebun</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-24" />
    </div>
  );
}
