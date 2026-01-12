/**
 * Gamification Engine
 * 
 * Main class that orchestrates all gamification logic:
 * - Recording reading progress and awarding rewards
 * - Managing streak tracking
 * - Processing check-ins and prayers
 * - Handling node completion and unlocking
 */

import {
  getUserById,
  getInventory,
  updateInventory,
  getStreak,
  updateStreak,
  updatePrayerLog,
  updateUserXP,
  getUserProgress,
  upsertProgress,
  getNodeById,
  getNodePrerequisites,
  getNodesByIsland,
  startReadingSession,
  endReadingSession,
} from "../db";

import {
  calculateSeedsFromReading,
  calculateXPFromReading,
  calculateSurahCompletionBonus,
  calculateWaterFromPrayers,
  calculateCheckinWater,
  calculateSharingReward,
  getStreakMultiplier,
  getTodayDate,
  areConsecutiveDays,
} from "./rewards";

import {
  type Resources,
  type PrayerName,
  type ProgressStatus,
  type RecordProgressResponse,
  type DailyCheckinResponse,
  type ShareActionResponse,
  GAME_CONFIG,
} from "./types";

export class GamificationEngine {
  /**
   * Record reading progress and award rewards
   */
  async recordReadingProgress(
    userId: string,
    surahId: number,
    versesRead: string[], // Array of verse keys like "2:255"
    durationSeconds?: number,
    scrollDepth?: number
  ): Promise<RecordProgressResponse> {
    // Calculate base rewards
    const versesCount = versesRead.length;
    let seedsEarned = calculateSeedsFromReading(versesCount);
    let xpEarned = calculateXPFromReading(versesCount);

    // Get user's current streak for multiplier
    const streak = await getStreak(userId);
    const multiplier = streak ? getStreakMultiplier(streak.current_streak) : 1;

    seedsEarned = Math.floor(seedsEarned * multiplier);
    xpEarned = Math.floor(xpEarned * multiplier);

    // Find the corresponding node for this surah
    const nodeProgress = await this.updateNodeProgress(
      userId,
      surahId,
      versesRead
    );

    // Check if node was completed
    if (nodeProgress?.completed) {
      const bonus = calculateSurahCompletionBonus();
      seedsEarned += bonus.seeds;
      xpEarned += bonus.xp;
    }

    // Update inventory
    if (seedsEarned > 0) {
      await updateInventory(userId, { seeds: seedsEarned });
    }

    // Update XP
    if (xpEarned > 0) {
      await updateUserXP(userId, xpEarned);
    }

    // Record reading session for analytics
    if (durationSeconds) {
      const session = await startReadingSession(userId, surahId, 1);
      const endVerse = versesRead.length > 0 
        ? parseInt(versesRead[versesRead.length - 1].split(":")[1]) 
        : 1;
      await endReadingSession(
        session.id,
        endVerse,
        durationSeconds,
        scrollDepth || 0
      );
    }

    return {
      success: true,
      seedsEarned,
      xpEarned,
      nodeProgress: nodeProgress
        ? {
            nodeId: nodeProgress.nodeId,
            progressPercent: nodeProgress.progressPercent,
            completed: nodeProgress.completed,
          }
        : undefined,
    };
  }

  /**
   * Update node progress for a surah
   */
  private async updateNodeProgress(
    userId: string,
    surahId: number,
    versesRead: string[]
  ): Promise<{
    nodeId: string;
    progressPercent: number;
    completed: boolean;
  } | null> {
    // This would need to query for the node with content_refs.surah_id = surahId
    // For now, returning null as we don't have the node ID
    // In production, you'd join with nodes table
    
    // Simplified: we assume 1 surah = 1 node
    // Get all nodes and find matching one
    // This is a placeholder - in real implementation, 
    // you'd have a more efficient query
    
    return null;
  }

  /**
   * Process daily check-in
   */
  async processCheckin(
    userId: string,
    prayers?: PrayerName[]
  ): Promise<DailyCheckinResponse> {
    const today = getTodayDate();
    
    // Get current streak
    const currentStreak = await getStreak(userId);
    if (!currentStreak) {
      throw new Error("User streak data not found");
    }

    // Calculate water from check-in
    let waterEarned = calculateCheckinWater();
    
    // Check if this is a new day
    const isNewDay = currentStreak.last_active_date !== today;
    const wasConsecutive = currentStreak.last_active_date 
      ? areConsecutiveDays(currentStreak.last_active_date, today)
      : false;

    // Update streak if new day
    let newStreakValue = currentStreak.current_streak;
    if (isNewDay) {
      const updatedStreak = await updateStreak(userId, today);
      newStreakValue = updatedStreak.current_streak;
    }

    // Process prayer confirmations
    let prayerBonus = 0;
    if (prayers && prayers.length > 0) {
      // Get existing prayers for today
      const existingPrayers = currentStreak.prayer_log[today]
        ? (Object.keys(currentStreak.prayer_log[today]) as PrayerName[])
        : [];

      prayerBonus = calculateWaterFromPrayers(prayers, existingPrayers);
      waterEarned += prayerBonus;

      // Log each prayer
      for (const prayer of prayers) {
        await updatePrayerLog(userId, today, prayer, true);
      }
    }

    // Update inventory with water
    if (waterEarned > 0) {
      await updateInventory(userId, { water: waterEarned });
    }

    return {
      success: true,
      waterEarned,
      streakData: {
        currentStreak: newStreakValue,
        isNewStreak: isNewDay && wasConsecutive,
      },
      prayerBonus,
    };
  }

  /**
   * Process social sharing action
   */
  async processShare(
    userId: string,
    shareType: "verse" | "surah" | "progress" | "achievement",
    _contentId?: string
  ): Promise<ShareActionResponse> {
    // Get current inventory to check daily sunlight cap
    const inventory = await getInventory(userId);
    if (!inventory) {
      throw new Error("User inventory not found");
    }

    // Calculate sunlight earned (respecting daily cap)
    // Note: In production, you'd track daily sunlight separately
    const sunlightEarned = calculateSharingReward(0); // Simplified

    if (sunlightEarned > 0) {
      await updateInventory(userId, { sunlight: sunlightEarned });
    }

    return {
      success: true,
      sunlightEarned,
    };
  }

  /**
   * Check and unlock available nodes for a user
   */
  async checkNodeUnlocks(userId: string, islandId: number): Promise<string[]> {
    const unlockedNodes: string[] = [];
    const nodes = await getNodesByIsland(islandId);
    
    for (const node of nodes) {
      const progress = await getUserProgress(userId, node.id);
      
      // Skip if already unlocked or completed
      if (progress.length > 0 && progress[0].status !== "locked") {
        continue;
      }

      // Check prerequisites
      const prereqs = await getNodePrerequisites(node.id);
      
      if (prereqs.length === 0) {
        // No prerequisites - unlock
        await upsertProgress(userId, node.id, { status: "unlocked" });
        unlockedNodes.push(node.id);
        continue;
      }

      // Check if all prerequisites are completed
      let allCompleted = true;
      for (const prereqId of prereqs) {
        const prereqProgress = await getUserProgress(userId, prereqId);
        if (prereqProgress.length === 0 || prereqProgress[0].status !== "completed") {
          allCompleted = false;
          break;
        }
      }

      if (allCompleted) {
        await upsertProgress(userId, node.id, { status: "unlocked" });
        unlockedNodes.push(node.id);
      }
    }

    return unlockedNodes;
  }

  /**
   * Get user's gamification profile summary
   */
  async getUserProfile(userId: string) {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const inventory = await getInventory(userId);
    const streak = await getStreak(userId);
    const progress = await getUserProgress(userId);

    const completedNodes = progress.filter((p) => p.status === "completed").length;
    const inProgressNodes = progress.filter((p) => p.status === "in_progress").length;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      level: user.level,
      totalXp: user.total_xp,
      inventory: inventory
        ? {
            seeds: inventory.seeds,
            water: inventory.water,
            sunlight: inventory.sunlight,
          }
        : { seeds: 0, water: 0, sunlight: 0 },
      streak: streak
        ? {
            current: streak.current_streak,
            longest: streak.longest_streak,
            lastActive: streak.last_active_date,
          }
        : { current: 0, longest: 0, lastActive: null },
      progress: {
        completedNodes,
        inProgressNodes,
        totalProgress: progress.length,
      },
    };
  }

  /**
   * Award custom resources (for special events, admin actions, etc.)
   */
  async awardResources(
    userId: string,
    resources: Partial<Resources>
  ): Promise<Resources> {
    const updated = await updateInventory(userId, {
      seeds: resources.seeds || 0,
      water: resources.water || 0,
      sunlight: resources.sunlight || 0,
    });

    return {
      seeds: updated.seeds,
      water: updated.water,
      sunlight: updated.sunlight,
    };
  }

  /**
   * Spend resources (for planting, etc.)
   */
  async spendResources(
    userId: string,
    resources: Partial<Resources>
  ): Promise<{ success: boolean; inventory: Resources }> {
    const inventory = await getInventory(userId);
    if (!inventory) {
      throw new Error("User inventory not found");
    }

    // Check if user has enough resources
    if (resources.seeds && inventory.seeds < resources.seeds) {
      return {
        success: false,
        inventory: {
          seeds: inventory.seeds,
          water: inventory.water,
          sunlight: inventory.sunlight,
        },
      };
    }
    if (resources.water && inventory.water < resources.water) {
      return {
        success: false,
        inventory: {
          seeds: inventory.seeds,
          water: inventory.water,
          sunlight: inventory.sunlight,
        },
      };
    }
    if (resources.sunlight && inventory.sunlight < resources.sunlight) {
      return {
        success: false,
        inventory: {
          seeds: inventory.seeds,
          water: inventory.water,
          sunlight: inventory.sunlight,
        },
      };
    }

    // Deduct resources (negative values)
    const updated = await updateInventory(userId, {
      seeds: resources.seeds ? -resources.seeds : 0,
      water: resources.water ? -resources.water : 0,
      sunlight: resources.sunlight ? -resources.sunlight : 0,
    });

    return {
      success: true,
      inventory: {
        seeds: updated.seeds,
        water: updated.water,
        sunlight: updated.sunlight,
      },
    };
  }
}

// Export singleton instance
export const gamificationEngine = new GamificationEngine();
