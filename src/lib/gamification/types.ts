// =====================
// GAMIFICATION TYPES
// =====================

// Resource types for the garden economy
export type ResourceType = "seeds" | "water" | "sunlight";

export interface Resources {
  seeds: number;
  water: number;
  sunlight: number;
}

// Plant states in the state machine
export type PlantState =
  | "planted"
  | "sprouting"
  | "blooming"
  | "withered"
  | "harvested";

// Plant rarity tiers
export type PlantRarity = "common" | "uncommon" | "rare" | "legendary";

// Node types in the journey map
export type NodeType = "surah" | "verse_group" | "theme" | "quiz";

// Progress status for journey nodes
export type ProgressStatus = "locked" | "unlocked" | "in_progress" | "completed";

// =====================
// ISLAND (Pulau/Level)
// =====================
export interface Island {
  id: number;
  nameId: string; // Indonesian name
  nameAr: string | null; // Arabic name
  nameEn: string | null; // English name
  description: string | null;
  theme: string;
  icon: string | null;
  orderIndex: number;
  color: string | null;
  unlockRequirement: UnlockRequirement | null;
}

export interface UnlockRequirement {
  type: "island_completed" | "nodes_completed" | "xp_required";
  value: number;
  islandId?: number; // For island_completed type
}

// =====================
// NODE (Journey Point)
// =====================
export interface Node {
  id: string;
  islandId: number;
  name: string;
  nameAr: string | null;
  type: NodeType;
  contentRefs: ContentReference;
  completionCriteria: CompletionCriteria;
  description: string | null;
  xpReward: number;
  seedReward: number;
  orderIndex: number;
  estimatedMinutes: number | null;
}

export interface ContentReference {
  surahId?: number;
  surahs?: number[]; // For theme nodes
  verses?: number[]; // Specific verses [start, end]
  quizId?: string; // For quiz nodes
}

export interface CompletionCriteria {
  type: "read_percent" | "quiz_score" | "time_spent";
  value: number; // Percentage or minutes
}

// =====================
// USER PROGRESS
// =====================
export interface UserProgress {
  id: string;
  userId: string;
  nodeId: string;
  status: ProgressStatus;
  progressPercent: number;
  versesRead: string[]; // Array of verse keys like "2:255"
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
}

// =====================
// INVENTORY
// =====================
export interface UserInventory {
  userId: string;
  seeds: number;
  water: number;
  sunlight: number;
  specialItems: Record<string, number>;
  updatedAt: Date;
}

// =====================
// PLANT TYPE
// =====================
export interface PlantType {
  id: number;
  name: string;
  nameId: string; // Indonesian name
  description: string | null;
  icon: string | null;
  rarity: PlantRarity;
  seedsRequired: number;
  waterToSprout: number;
  waterToBloom: number;
  sunlightBonus: number; // Reduces water requirement
  growthTimeHours: number;
  xpOnHarvest: number;
}

// =====================
// GARDEN PLANT (Instance)
// =====================
export interface GardenPlant {
  id: string;
  userId: string;
  plantTypeId: number;
  gridX: number;
  gridY: number;
  state: PlantState;
  waterReceived: number;
  sunlightReceived: number;
  plantedAt: Date;
  lastWatered: Date;
  bloomedAt: Date | null;
  harvestedAt: Date | null;
}

// Extended plant with type info
export interface GardenPlantWithType extends GardenPlant {
  plantType: PlantType;
}

// =====================
// STREAKS
// =====================
export interface UserStreaks {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  prayerLog: PrayerLog;
  weeklyCheckins: number;
  totalCheckins: number;
  updatedAt: Date;
}

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerLog {
  [date: string]: {
    [prayer in PrayerName]?: boolean;
  };
}

// =====================
// ACHIEVEMENTS
// =====================
export interface Achievement {
  id: number;
  code: string;
  name: string;
  nameId: string;
  description: string | null;
  icon: string | null;
  xpReward: number;
  seedReward: number;
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type:
    | "streak"
    | "surahs_completed"
    | "island_completed"
    | "plants_planted"
    | "plants_bloomed"
    | "daily_prayers"
    | "prayer_streak";
  value: number;
  islandId?: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: number;
  unlockedAt: Date;
}

// =====================
// READING SESSION
// =====================
export interface ReadingSession {
  id: string;
  userId: string;
  surahId: number;
  startVerse: number;
  endVerse: number;
  durationSeconds: number | null;
  scrollDepthPercent: number | null;
  startedAt: Date;
  endedAt: Date | null;
}

// =====================
// API REQUEST/RESPONSE TYPES
// =====================

// Progress API
export interface RecordProgressRequest {
  userId: string;
  surahId: number;
  versesRead: string[]; // Array of verse keys
  durationSeconds?: number;
  scrollDepth?: number;
}

export interface RecordProgressResponse {
  success: boolean;
  seedsEarned: number;
  xpEarned: number;
  nodeProgress?: {
    nodeId: string;
    progressPercent: number;
    completed: boolean;
  };
  newAchievements?: Achievement[];
}

// Garden API
export interface PlantSeedRequest {
  userId: string;
  plantTypeId: number;
  gridX: number;
  gridY: number;
}

export interface WaterPlantRequest {
  userId: string;
  plantId: string;
}

export interface GardenActionResponse {
  success: boolean;
  plant?: GardenPlantWithType;
  inventory?: Resources;
  error?: string;
}

// Check-in API
export interface DailyCheckinRequest {
  userId: string;
  prayers?: PrayerName[]; // Prayers completed
}

export interface DailyCheckinResponse {
  success: boolean;
  waterEarned: number;
  streakData: {
    currentStreak: number;
    isNewStreak: boolean;
  };
  prayerBonus: number;
  newAchievements?: Achievement[];
}

// Share API
export interface ShareActionRequest {
  userId: string;
  shareType: "verse" | "surah" | "progress" | "achievement";
  contentId?: string;
}

export interface ShareActionResponse {
  success: boolean;
  sunlightEarned: number;
}

// =====================
// GAME CONFIG
// =====================
export const GAME_CONFIG = {
  // Seed earning rates
  SEEDS_PER_10_VERSES: 1,
  SEEDS_PER_SURAH_COMPLETE: 5,
  
  // Water earning rates
  WATER_PER_PRAYER: 5,
  WATER_BONUS_ALL_5_PRAYERS: 10,
  WATER_DAILY_CHECKIN: 3,
  
  // Sunlight earning rates
  SUNLIGHT_PER_SHARE: 3,
  SUNLIGHT_DAILY_CAP: 15, // Max sunlight per day from sharing
  
  // XP rates
  XP_PER_VERSE: 1,
  XP_PER_NODE_COMPLETE: 50,
  XP_PER_ISLAND_COMPLETE: 500,
  
  // Streak bonuses
  STREAK_MULTIPLIER_7_DAYS: 1.5,
  STREAK_MULTIPLIER_30_DAYS: 2.0,
  
  // Garden config
  GARDEN_GRID_SIZE: 5, // 5x5 grid
  WITHER_HOURS: 48,
  
  // Level calculation
  XP_PER_LEVEL: 100, // XP needed per level (sqrt formula used)
} as const;

// =====================
// HELPER TYPES
// =====================

// For API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// For the journey map visualization
export interface JourneyMapData {
  islands: Island[];
  nodes: Map<number, Node[]>; // Keyed by island_id
  userProgress: Map<string, UserProgress>; // Keyed by node_id
  currentPosition: {
    islandId: number;
    nodeId: string | null;
  };
}

// For the garden visualization
export interface GardenData {
  plants: GardenPlantWithType[];
  plantTypes: PlantType[];
  inventory: Resources;
  gridSize: number;
}

// User profile with all gamification data
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  inventory: Resources;
  streaks: UserStreaks;
  achievements: Achievement[];
  currentIsland: number;
  plantsGrown: number;
}
