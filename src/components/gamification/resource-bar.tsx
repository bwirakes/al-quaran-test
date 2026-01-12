"use client";

/**
 * Resource Bar Component
 * 
 * Displays the user's current resources (Seeds, Water, Sunlight)
 * and streak information in a compact bar format.
 */

import { Leaf, Droplets, Sun, Flame } from "lucide-react";

interface ResourceBarProps {
  seeds: number;
  water: number;
  sunlight: number;
  streak: number;
  level: number;
  xp: number;
  compact?: boolean;
}

export function ResourceBar({
  seeds,
  water,
  sunlight,
  streak,
  level,
  xp,
  compact = false,
}: ResourceBarProps) {
  const xpForNextLevel = Math.pow(level * 10, 2);
  const xpForCurrentLevel = Math.pow((level - 1) * 10, 2);
  const xpProgress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1 text-amber-600">
          <Leaf className="w-4 h-4" />
          <span className="font-medium">{seeds}</span>
        </div>
        <div className="flex items-center gap-1 text-sky-600">
          <Droplets className="w-4 h-4" />
          <span className="font-medium">{water}</span>
        </div>
        <div className="flex items-center gap-1 text-orange-500">
          <Sun className="w-4 h-4" />
          <span className="font-medium">{sunlight}</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-red-500">
            <Flame className="w-4 h-4" />
            <span className="font-medium">{streak}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-2xl p-4 border border-emerald-100">
      {/* Level and XP */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {level}
          </div>
          <div>
            <p className="text-xs text-slate-500">Level</p>
            <p className="text-sm font-semibold text-slate-800">{xp.toLocaleString("id-ID")} XP</p>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 px-3 py-1.5 rounded-full">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-700">{streak} hari</span>
          </div>
        )}
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1 text-right">
          {xpForNextLevel - xp} XP ke level {level + 1}
        </p>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-3 gap-3">
        <ResourceItem
          icon={<Leaf className="w-5 h-5" />}
          value={seeds}
          label="Benih"
          color="amber"
        />
        <ResourceItem
          icon={<Droplets className="w-5 h-5" />}
          value={water}
          label="Air"
          color="sky"
        />
        <ResourceItem
          icon={<Sun className="w-5 h-5" />}
          value={sunlight}
          label="Cahaya"
          color="orange"
        />
      </div>
    </div>
  );
}

function ResourceItem({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: "amber" | "sky" | "orange";
}) {
  const colors = {
    amber: "bg-amber-100 text-amber-600",
    sky: "bg-sky-100 text-sky-600",
    orange: "bg-orange-100 text-orange-500",
  };

  return (
    <div className={`${colors[color]} rounded-xl p-3 text-center`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}
