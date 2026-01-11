/**
 * Gamification Module Exports
 * 
 * This module provides a complete gamification system for the Quran app:
 * - Journey Map (Safar): Thematic progression through the Quran
 * - Garden (Kebun): Virtual garden with plant growth mechanics
 * - Rewards: XP, Seeds, Water, and Sunlight economy
 * - Streaks: Daily engagement tracking
 */

// Types
export * from "./types";

// Reward calculations
export {
  calculateSeedsFromReading,
  calculateXPFromReading,
  calculateSurahCompletionBonus,
  calculateIslandCompletionBonus,
  getStreakMultiplier,
  applyStreakMultiplier,
  calculateWaterFromPrayers,
  areAllPrayersComplete,
  calculateCheckinWater,
  calculateSharingReward,
  calculateLevel,
  xpForNextLevel,
  levelProgress,
  calculateHarvestRewards,
  calculateEffectiveWaterNeeded,
  formatNumber,
  getTodayDate,
  areConsecutiveDays,
  hoursSince,
} from "./rewards";

// Gamification Engine
export { GamificationEngine, gamificationEngine } from "./engine";

// Garden Manager
export {
  GardenManager,
  gardenManager,
  updateGardenState,
  shouldWither,
} from "./garden";
