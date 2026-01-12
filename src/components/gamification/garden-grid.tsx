"use client";

/**
 * Garden Grid Component
 * 
 * Displays the user's virtual garden as a grid.
 * Plants can be watered, and their states are visualized.
 */

import { useState } from "react";
import { 
  Flower2, 
  Sprout, 
  Leaf, 
  Droplets,
  AlertTriangle,
  Plus,
  Crown,
} from "lucide-react";

type PlantState = "empty" | "planted" | "sprouting" | "blooming" | "withered";
type PlantRarity = "common" | "uncommon" | "rare" | "legendary";

interface Plant {
  id: string;
  state: PlantState;
  name: string;
  icon: string;
  rarity: PlantRarity;
  waterReceived: number;
  waterNeeded: number;
}

interface GardenGridProps {
  plants: (Plant | null)[];
  gridSize: number;
  onPlant: (index: number) => void;
  onWater: (plantId: string) => void;
  waterAvailable: number;
}

const stateIcons: Record<PlantState, React.ComponentType<{ className?: string }>> = {
  empty: Plus,
  planted: Leaf,
  sprouting: Sprout,
  blooming: Flower2,
  withered: AlertTriangle,
};

const rarityColors: Record<PlantRarity, string> = {
  common: "#496580",
  uncommon: "#0891B2",
  rare: "#7C3AED",
  legendary: "#F59E0B",
};

const rarityBorders: Record<PlantRarity, string> = {
  common: "border-sky-200",
  uncommon: "border-cyan-300",
  rare: "border-violet-300",
  legendary: "border-amber-300",
};

export function GardenGrid({
  plants,
  gridSize,
  onPlant,
  onWater,
  waterAvailable,
}: GardenGridProps) {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  return (
    <div 
      className="grid gap-3 p-4 bg-sky-50/50 rounded-2xl border border-sky-200"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const plant = plants[index];
        return (
          <GardenCell
            key={index}
            index={index}
            plant={plant}
            isSelected={selectedCell === index}
            onSelect={() => setSelectedCell(selectedCell === index ? null : index)}
            onPlant={() => onPlant(index)}
            onWater={() => plant && onWater(plant.id)}
            waterAvailable={waterAvailable}
          />
        );
      })}
    </div>
  );
}

function GardenCell({
  index,
  plant,
  isSelected,
  onSelect,
  onPlant,
  onWater,
  waterAvailable,
}: {
  index: number;
  plant: Plant | null;
  isSelected: boolean;
  onSelect: () => void;
  onPlant: () => void;
  onWater: () => void;
  waterAvailable: number;
}) {
  if (!plant) {
    // Empty cell
    return (
      <button
        onClick={onPlant}
        className="aspect-square rounded-xl border-2 border-dashed border-sky-300 bg-white/50 hover:bg-sky-100/50 hover:border-sky-400 transition-all flex items-center justify-center group"
      >
        <Plus className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  const StateIcon = stateIcons[plant.state];
  const waterProgress = (plant.waterReceived / plant.waterNeeded) * 100;
  const plantColor = rarityColors[plant.rarity];

  return (
    <button
      onClick={onSelect}
      className={`
        aspect-square rounded-xl border-2 transition-all relative overflow-hidden
        ${rarityBorders[plant.rarity]}
        ${isSelected ? "ring-2 ring-sky-400 ring-offset-2" : ""}
        ${plant.state === "withered" ? "bg-amber-50" : "bg-white"}
        hover:shadow-md
      `}
    >
      {/* Background glow for legendary */}
      {plant.rarity === "legendary" && plant.state === "blooming" && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-orange-100/50 animate-pulse" />
      )}

      {/* Plant icon */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
        {plant.state === "blooming" ? (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: plantColor }}
          >
            {plant.rarity === "legendary" ? (
              <Crown className="w-5 h-5 text-white" />
            ) : (
              <Flower2 className="w-5 h-5 text-white" />
            )}
          </div>
        ) : plant.state === "withered" ? (
          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
            <div style={{ color: plantColor }}>
              <StateIcon className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Plant name */}
        <p className="text-[10px] text-slate-600 mt-1 truncate w-full text-center">
          {plant.name}
        </p>

        {/* Water progress (only for non-blooming) */}
        {plant.state !== "blooming" && plant.state !== "withered" && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(waterProgress, 100)}%`, backgroundColor: '#496580' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action buttons on hover/select */}
      {isSelected && plant.state !== "blooming" && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 z-20">
          {waterAvailable > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWater();
              }}
              className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#496580' }}
            >
              <Droplets className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </button>
  );
}

// Plant selection modal
export function PlantSelector({
  isOpen,
  onClose,
  onSelect,
  availableSeeds,
  plantTypes,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (plantTypeId: number) => void;
  availableSeeds: number;
  plantTypes: Array<{
    id: number;
    name: string;
    nameId: string;
    rarity: PlantRarity;
    seedsRequired: number;
    waterToBloom: number;
    icon: string;
  }>;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-stone-200">
          <h3 className="font-bold text-lg text-slate-900">Pilih Tanaman</h3>
          <p className="text-sm text-slate-500">Kamu punya {availableSeeds} benih</p>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
          {plantTypes.map((plant) => {
            const canAfford = availableSeeds >= plant.seedsRequired;
            const plantColor = rarityColors[plant.rarity];
            return (
              <button
                key={plant.id}
                onClick={() => canAfford && onSelect(plant.id)}
                disabled={!canAfford}
                className={`
                  w-full p-4 rounded-xl border-2 text-left transition-all
                  ${canAfford 
                    ? `${rarityBorders[plant.rarity]} hover:shadow-md hover:bg-sky-50` 
                    : "border-slate-200 opacity-50 cursor-not-allowed"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${plantColor}20` }}
                  >
                    <div style={{ color: plantColor }}>
                      <Sprout className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{plant.nameId}</p>
                    <p className="text-xs text-slate-500">{plant.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1" style={{ color: '#496580' }}>
                        <Leaf className="w-3 h-3" />
                        {plant.seedsRequired}
                      </span>
                      <span className="flex items-center gap-1" style={{ color: '#496580' }}>
                        <Droplets className="w-3 h-3" />
                        {plant.waterToBloom}
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    plant.rarity === "common" ? "bg-sky-50 text-[#496580]" :
                    plant.rarity === "uncommon" ? "bg-cyan-100 text-cyan-700" :
                    plant.rarity === "rare" ? "bg-violet-100 text-violet-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {plant.rarity}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-stone-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
