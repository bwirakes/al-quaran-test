/**
 * Garden Logic Module
 * 
 * Implements the plant state machine and garden management:
 * - State transitions: Planted -> Sprouting -> Blooming -> Withered
 * - Watering and sunlight mechanics
 * - Daily garden state updates (withering)
 */

import {
  getInventory,
  updateInventory,
  getUserGarden,
  getGardenPlant,
  plantInGarden,
  updateGardenPlant,
  waterGardenPlant,
  harvestPlant,
  getPlantTypeById,
  getAllPlantTypes,
  witherPlants,
  updateUserXP,
} from "../db";

import {
  type PlantState,
  type PlantType,
  type GardenPlant,
  type GardenPlantWithType,
  type GardenActionResponse,
  type Resources,
  GAME_CONFIG,
} from "./types";

import { calculateHarvestRewards, calculateEffectiveWaterNeeded, hoursSince } from "./rewards";

/**
 * Garden Manager Class
 * 
 * Handles all garden-related operations and state machine transitions
 */
export class GardenManager {
  /**
   * Get a user's complete garden state
   */
  async getGarden(userId: string): Promise<{
    plants: GardenPlantWithType[];
    plantTypes: PlantType[];
    inventory: Resources;
    gridSize: number;
  }> {
    const [gardenPlants, plantTypes, inventory] = await Promise.all([
      getUserGarden(userId),
      getAllPlantTypes(),
      getInventory(userId),
    ]);

    // Enrich plants with type information
    const plants: GardenPlantWithType[] = [];
    for (const plant of gardenPlants) {
      const plantType = plantTypes.find((pt) => pt.id === plant.plant_type_id);
      if (plantType) {
        plants.push({
          ...plant,
          id: plant.id,
          userId: plant.user_id,
          plantTypeId: plant.plant_type_id,
          gridX: plant.grid_x,
          gridY: plant.grid_y,
          waterReceived: plant.water_received,
          sunlightReceived: plant.sunlight_received,
          plantedAt: plant.planted_at,
          lastWatered: plant.last_watered,
          bloomedAt: plant.bloomed_at,
          harvestedAt: plant.harvested_at,
          plantType: {
            id: plantType.id,
            name: plantType.name,
            nameId: plantType.name_id,
            description: plantType.description,
            icon: plantType.icon,
            rarity: plantType.rarity as PlantType["rarity"],
            seedsRequired: plantType.seeds_required,
            waterToSprout: plantType.water_to_sprout,
            waterToBloom: plantType.water_to_bloom,
            sunlightBonus: plantType.sunlight_bonus,
            growthTimeHours: plantType.growth_time_hours,
            xpOnHarvest: plantType.xp_on_harvest,
          },
        });
      }
    }

    return {
      plants,
      plantTypes: plantTypes.map((pt) => ({
        id: pt.id,
        name: pt.name,
        nameId: pt.name_id,
        description: pt.description,
        icon: pt.icon,
        rarity: pt.rarity as PlantType["rarity"],
        seedsRequired: pt.seeds_required,
        waterToSprout: pt.water_to_sprout,
        waterToBloom: pt.water_to_bloom,
        sunlightBonus: pt.sunlight_bonus,
        growthTimeHours: pt.growth_time_hours,
        xpOnHarvest: pt.xp_on_harvest,
      })),
      inventory: inventory
        ? {
            seeds: inventory.seeds,
            water: inventory.water,
            sunlight: inventory.sunlight,
          }
        : { seeds: 0, water: 0, sunlight: 0 },
      gridSize: GAME_CONFIG.GARDEN_GRID_SIZE,
    };
  }

  /**
   * Plant a new seed in the garden
   */
  async plantSeed(
    userId: string,
    plantTypeId: number,
    gridX: number,
    gridY: number
  ): Promise<GardenActionResponse> {
    // Validate grid position
    if (
      gridX < 0 ||
      gridX >= GAME_CONFIG.GARDEN_GRID_SIZE ||
      gridY < 0 ||
      gridY >= GAME_CONFIG.GARDEN_GRID_SIZE
    ) {
      return {
        success: false,
        error: "Invalid grid position",
      };
    }

    // Check if position is already occupied
    const existingPlant = await getGardenPlant(userId, gridX, gridY);
    if (existingPlant && existingPlant.state !== "harvested") {
      return {
        success: false,
        error: "Position already occupied",
      };
    }

    // Get plant type
    const plantType = await getPlantTypeById(plantTypeId);
    if (!plantType) {
      return {
        success: false,
        error: "Invalid plant type",
      };
    }

    // Check if user has enough seeds
    const inventory = await getInventory(userId);
    if (!inventory || inventory.seeds < plantType.seeds_required) {
      return {
        success: false,
        error: `Not enough seeds. Need ${plantType.seeds_required}, have ${inventory?.seeds || 0}`,
      };
    }

    // Deduct seeds
    await updateInventory(userId, { seeds: -plantType.seeds_required });

    // Plant the seed
    const plant = await plantInGarden(userId, plantTypeId, gridX, gridY);

    // Get updated inventory
    const updatedInventory = await getInventory(userId);

    return {
      success: true,
      plant: {
        ...plant,
        id: plant.id,
        userId: plant.user_id,
        plantTypeId: plant.plant_type_id,
        gridX: plant.grid_x,
        gridY: plant.grid_y,
        waterReceived: plant.water_received,
        sunlightReceived: plant.sunlight_received,
        plantedAt: plant.planted_at,
        lastWatered: plant.last_watered,
        bloomedAt: plant.bloomed_at,
        harvestedAt: plant.harvested_at,
        plantType: {
          id: plantType.id,
          name: plantType.name,
          nameId: plantType.name_id,
          description: plantType.description,
          icon: plantType.icon,
          rarity: plantType.rarity as PlantType["rarity"],
          seedsRequired: plantType.seeds_required,
          waterToSprout: plantType.water_to_sprout,
          waterToBloom: plantType.water_to_bloom,
          sunlightBonus: plantType.sunlight_bonus,
          growthTimeHours: plantType.growth_time_hours,
          xpOnHarvest: plantType.xp_on_harvest,
        },
      },
      inventory: updatedInventory
        ? {
            seeds: updatedInventory.seeds,
            water: updatedInventory.water,
            sunlight: updatedInventory.sunlight,
          }
        : undefined,
    };
  }

  /**
   * Water a plant
   * 
   * State transitions:
   * - Planted + enough water -> Sprouting
   * - Sprouting + enough water -> Blooming
   * - Withered + sunlight -> Sprouting (revival)
   */
  async waterPlant(
    userId: string,
    plantId: string
  ): Promise<GardenActionResponse> {
    // Get the plant
    const plants = await getUserGarden(userId);
    const plant = plants.find((p) => p.id === plantId);
    
    if (!plant) {
      return {
        success: false,
        error: "Plant not found",
      };
    }

    // Check if plant can be watered
    if (plant.state === "blooming" || plant.state === "harvested") {
      return {
        success: false,
        error: "Plant is already blooming or harvested",
      };
    }

    // Check if user has water
    const inventory = await getInventory(userId);
    if (!inventory || inventory.water < 1) {
      return {
        success: false,
        error: "Not enough water",
      };
    }

    // Get plant type for growth requirements
    const plantType = await getPlantTypeById(plant.plant_type_id);
    if (!plantType) {
      return {
        success: false,
        error: "Invalid plant type",
      };
    }

    // Deduct water
    await updateInventory(userId, { water: -1 });

    // Water the plant
    const wateredPlant = await waterGardenPlant(plantId);

    // Calculate new state based on water received
    let newState: PlantState = wateredPlant.state as PlantState;
    const effectiveWaterToSprout = calculateEffectiveWaterNeeded(
      plantType.water_to_sprout,
      wateredPlant.sunlight_received,
      plantType.sunlight_bonus
    );
    const effectiveWaterToBloom = calculateEffectiveWaterNeeded(
      plantType.water_to_bloom,
      wateredPlant.sunlight_received,
      plantType.sunlight_bonus
    );

    // State machine transitions
    if (plant.state === "withered") {
      // Revival requires sunlight
      if (wateredPlant.sunlight_received >= 10) {
        newState = "sprouting";
      } else {
        // Still withered, but water helps
        newState = "withered";
      }
    } else if (
      plant.state === "planted" &&
      wateredPlant.water_received >= effectiveWaterToSprout
    ) {
      newState = "sprouting";
    } else if (
      plant.state === "sprouting" &&
      wateredPlant.water_received >= effectiveWaterToBloom
    ) {
      newState = "blooming";
    }

    // Update state if changed
    if (newState !== plant.state) {
      await updateGardenPlant(plantId, { state: newState });
    }

    // Get updated data
    const updatedInventory = await getInventory(userId);
    const updatedPlants = await getUserGarden(userId);
    const updatedPlant = updatedPlants.find((p) => p.id === plantId);

    return {
      success: true,
      plant: updatedPlant
        ? {
            ...updatedPlant,
            id: updatedPlant.id,
            userId: updatedPlant.user_id,
            plantTypeId: updatedPlant.plant_type_id,
            gridX: updatedPlant.grid_x,
            gridY: updatedPlant.grid_y,
            waterReceived: updatedPlant.water_received,
            sunlightReceived: updatedPlant.sunlight_received,
            plantedAt: updatedPlant.planted_at,
            lastWatered: updatedPlant.last_watered,
            bloomedAt: updatedPlant.bloomed_at,
            harvestedAt: updatedPlant.harvested_at,
            plantType: {
              id: plantType.id,
              name: plantType.name,
              nameId: plantType.name_id,
              description: plantType.description,
              icon: plantType.icon,
              rarity: plantType.rarity as PlantType["rarity"],
              seedsRequired: plantType.seeds_required,
              waterToSprout: plantType.water_to_sprout,
              waterToBloom: plantType.water_to_bloom,
              sunlightBonus: plantType.sunlight_bonus,
              growthTimeHours: plantType.growth_time_hours,
              xpOnHarvest: plantType.xp_on_harvest,
            },
          }
        : undefined,
      inventory: updatedInventory
        ? {
            seeds: updatedInventory.seeds,
            water: updatedInventory.water,
            sunlight: updatedInventory.sunlight,
          }
        : undefined,
    };
  }

  /**
   * Add sunlight to a plant (from sharing)
   */
  async addSunlight(
    userId: string,
    plantId: string,
    amount: number
  ): Promise<GardenActionResponse> {
    const plants = await getUserGarden(userId);
    const plant = plants.find((p) => p.id === plantId);

    if (!plant) {
      return {
        success: false,
        error: "Plant not found",
      };
    }

    // Update sunlight
    await updateGardenPlant(plantId, {
      sunlight_received: plant.sunlight_received + amount,
    });

    const plantType = await getPlantTypeById(plant.plant_type_id);
    const updatedPlants = await getUserGarden(userId);
    const updatedPlant = updatedPlants.find((p) => p.id === plantId);
    const inventory = await getInventory(userId);

    return {
      success: true,
      plant: updatedPlant && plantType
        ? {
            ...updatedPlant,
            id: updatedPlant.id,
            userId: updatedPlant.user_id,
            plantTypeId: updatedPlant.plant_type_id,
            gridX: updatedPlant.grid_x,
            gridY: updatedPlant.grid_y,
            waterReceived: updatedPlant.water_received,
            sunlightReceived: updatedPlant.sunlight_received,
            plantedAt: updatedPlant.planted_at,
            lastWatered: updatedPlant.last_watered,
            bloomedAt: updatedPlant.bloomed_at,
            harvestedAt: updatedPlant.harvested_at,
            plantType: {
              id: plantType.id,
              name: plantType.name,
              nameId: plantType.name_id,
              description: plantType.description,
              icon: plantType.icon,
              rarity: plantType.rarity as PlantType["rarity"],
              seedsRequired: plantType.seeds_required,
              waterToSprout: plantType.water_to_sprout,
              waterToBloom: plantType.water_to_bloom,
              sunlightBonus: plantType.sunlight_bonus,
              growthTimeHours: plantType.growth_time_hours,
              xpOnHarvest: plantType.xp_on_harvest,
            },
          }
        : undefined,
      inventory: inventory
        ? {
            seeds: inventory.seeds,
            water: inventory.water,
            sunlight: inventory.sunlight,
          }
        : undefined,
    };
  }

  /**
   * Harvest a bloomed plant
   */
  async harvestPlant(
    userId: string,
    plantId: string
  ): Promise<GardenActionResponse & { xpEarned?: number; seedsEarned?: number }> {
    const plants = await getUserGarden(userId);
    const plant = plants.find((p) => p.id === plantId);

    if (!plant) {
      return {
        success: false,
        error: "Plant not found",
      };
    }

    if (plant.state !== "blooming") {
      return {
        success: false,
        error: "Plant is not ready to harvest",
      };
    }

    // Get plant type for rewards
    const plantType = await getPlantTypeById(plant.plant_type_id);
    if (!plantType) {
      return {
        success: false,
        error: "Invalid plant type",
      };
    }

    // Calculate harvest rewards
    const rewards = calculateHarvestRewards(
      plantType.xp_on_harvest,
      plantType.rarity as "common" | "uncommon" | "rare" | "legendary"
    );

    // Harvest the plant
    await harvestPlant(plantId);

    // Award XP and seeds
    await updateUserXP(userId, rewards.xp);
    await updateInventory(userId, { seeds: rewards.seeds });

    // Get updated data
    const inventory = await getInventory(userId);

    return {
      success: true,
      xpEarned: rewards.xp,
      seedsEarned: rewards.seeds,
      inventory: inventory
        ? {
            seeds: inventory.seeds,
            water: inventory.water,
            sunlight: inventory.sunlight,
          }
        : undefined,
    };
  }

  /**
   * Remove a plant from the garden
   */
  async removePlant(
    userId: string,
    plantId: string
  ): Promise<{ success: boolean; error?: string }> {
    const plants = await getUserGarden(userId);
    const plant = plants.find((p) => p.id === plantId);

    if (!plant) {
      return {
        success: false,
        error: "Plant not found",
      };
    }

    // Mark as harvested (soft delete)
    await harvestPlant(plantId);

    return { success: true };
  }
}

/**
 * Daily Garden State Update
 * 
 * This function should be called by a cron job to:
 * 1. Wither plants that haven't been watered in 48 hours
 * 2. Update any time-based growth states
 * 
 * Returns the number of plants that withered
 */
export async function updateGardenState(): Promise<{
  witheredCount: number;
  processedAt: Date;
}> {
  const witheredCount = await witherPlants();

  return {
    witheredCount,
    processedAt: new Date(),
  };
}

/**
 * Check if a specific plant should wither
 */
export function shouldWither(plant: GardenPlant): boolean {
  if (plant.state === "blooming" || plant.state === "harvested" || plant.state === "withered") {
    return false;
  }

  const hoursSinceWatered = hoursSince(new Date(plant.lastWatered));
  return hoursSinceWatered >= GAME_CONFIG.WITHER_HOURS;
}

// Export singleton instance
export const gardenManager = new GardenManager();
