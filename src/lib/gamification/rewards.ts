/**
 * Reward Calculation Module
 * 
 * Handles all reward calculations for the gamification system.
 */

import { GAME_CONFIG, type Resources, type PrayerName } from "./types";

// =====================
// READING REWARDS
// =====================

/**
 * Calculate seeds earned from reading verses
 */
export function calculateSeedsFromReading(versesRead: number): number {
  return Math.floor(versesRead / 10) * GAME_CONFIG.SEEDS_PER_10_VERSES;
}

/**
 * Calculate XP earned from reading verses
 */
export function calculateXPFromReading(versesRead: number): number {
  return versesRead * GAME_CONFIG.XP_PER_VERSE;
}

/**
 * Calculate bonus rewards for completing a surah
 */
export function calculateSurahCompletionBonus(): {
  seeds: number;
  xp: number;
} {
  return {
    seeds: GAME_CONFIG.SEEDS_PER_SURAH_COMPLETE,
    xp: GAME_CONFIG.XP_PER_NODE_COMPLETE,
  };
}

/**
 * Calculate bonus rewards for completing an island
 */
export function calculateIslandCompletionBonus(): {
  seeds: number;
  xp: number;
} {
  return {
    seeds: GAME_CONFIG.SEEDS_PER_SURAH_COMPLETE * 10,
    xp: GAME_CONFIG.XP_PER_ISLAND_COMPLETE,
  };
}

// =====================
// STREAK REWARDS
// =====================

/**
 * Get streak multiplier based on current streak length
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) {
    return GAME_CONFIG.STREAK_MULTIPLIER_30_DAYS;
  }
  if (streakDays >= 7) {
    return GAME_CONFIG.STREAK_MULTIPLIER_7_DAYS;
  }
  return 1.0;
}

/**
 * Apply streak multiplier to rewards
 */
export function applyStreakMultiplier(
  baseRewards: Resources,
  streakDays: number
): Resources {
  const multiplier = getStreakMultiplier(streakDays);
  return {
    seeds: Math.floor(baseRewards.seeds * multiplier),
    water: Math.floor(baseRewards.water * multiplier),
    sunlight: Math.floor(baseRewards.sunlight * multiplier),
  };
}

// =====================
// PRAYER REWARDS
// =====================

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

/**
 * Calculate water earned from prayer confirmations
 */
export function calculateWaterFromPrayers(
  prayers: PrayerName[],
  existingPrayersToday: PrayerName[] = []
): number {
  // Filter out prayers already confirmed today
  const newPrayers = prayers.filter((p) => !existingPrayersToday.includes(p));
  
  if (newPrayers.length === 0) return 0;

  let water = newPrayers.length * GAME_CONFIG.WATER_PER_PRAYER;

  // Check if all 5 prayers are now complete
  const allPrayers = [...new Set([...existingPrayersToday, ...newPrayers])];
  if (allPrayers.length === 5) {
    water += GAME_CONFIG.WATER_BONUS_ALL_5_PRAYERS;
  }

  return water;
}

/**
 * Check if all prayers for a day are completed
 */
export function areAllPrayersComplete(prayers: PrayerName[]): boolean {
  return PRAYER_ORDER.every((p) => prayers.includes(p));
}

// =====================
// CHECK-IN REWARDS
// =====================

/**
 * Calculate water earned from daily check-in
 */
export function calculateCheckinWater(): number {
  return GAME_CONFIG.WATER_DAILY_CHECKIN;
}

// =====================
// SHARING REWARDS
// =====================

/**
 * Calculate sunlight earned from sharing
 * Returns 0 if daily cap reached
 */
export function calculateSharingReward(
  currentDailySunlight: number
): number {
  if (currentDailySunlight >= GAME_CONFIG.SUNLIGHT_DAILY_CAP) {
    return 0;
  }

  const potential = GAME_CONFIG.SUNLIGHT_PER_SHARE;
  const remaining = GAME_CONFIG.SUNLIGHT_DAILY_CAP - currentDailySunlight;
  
  return Math.min(potential, remaining);
}

// =====================
// LEVEL CALCULATION
// =====================

/**
 * Calculate user level from total XP
 * Uses a square root formula for diminishing returns
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP) / 10) + 1;
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  return Math.pow((nextLevel - 1) * 10, 2);
}

/**
 * Calculate progress percentage to next level
 */
export function levelProgress(totalXP: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
} {
  const currentLevel = calculateLevel(totalXP);
  const xpAtCurrentLevel = Math.pow((currentLevel - 1) * 10, 2);
  const xpAtNextLevel = Math.pow(currentLevel * 10, 2);
  
  const xpInCurrentLevel = totalXP - xpAtCurrentLevel;
  const xpNeededForNext = xpAtNextLevel - xpAtCurrentLevel;
  const progressPercent = Math.floor((xpInCurrentLevel / xpNeededForNext) * 100);

  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercent,
  };
}

// =====================
// GARDEN REWARDS
// =====================

/**
 * Calculate XP and rewards for harvesting a bloomed plant
 */
export function calculateHarvestRewards(
  baseXP: number,
  rarity: "common" | "uncommon" | "rare" | "legendary"
): {
  xp: number;
  seeds: number;
} {
  const rarityMultipliers = {
    common: 1.0,
    uncommon: 1.5,
    rare: 2.0,
    legendary: 3.0,
  };

  const multiplier = rarityMultipliers[rarity];
  
  return {
    xp: Math.floor(baseXP * multiplier),
    seeds: Math.floor((baseXP * multiplier) / 10),
  };
}

/**
 * Calculate effective water needed accounting for sunlight bonus
 */
export function calculateEffectiveWaterNeeded(
  baseWaterNeeded: number,
  sunlightReceived: number,
  sunlightBonus: number
): number {
  const reduction = Math.min(
    sunlightReceived,
    sunlightBonus
  );
  return Math.max(baseWaterNeeded - reduction, 1);
}

// =====================
// UTILITY FUNCTIONS
// =====================

/**
 * Format number with Indonesian locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if two dates are consecutive days
 */
export function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Calculate hours since a given timestamp
 */
export function hoursSince(timestamp: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  return diffMs / (1000 * 60 * 60);
}
