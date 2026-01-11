/**
 * Garden API Route
 * 
 * Manages the virtual garden:
 * - GET: Retrieve user's garden state
 * - POST: Plant, water, harvest, or add sunlight to plants
 * 
 * POST /api/gamification/garden
 * Body: { userId, action: "plant" | "water" | "sunlight" | "harvest" | "remove", ... }
 */

import { NextRequest, NextResponse } from "next/server";
import { gardenManager } from "@/lib/gamification";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const garden = await gardenManager.getGarden(userId);

    return NextResponse.json({
      success: true,
      data: garden,
    });
  } catch (error) {
    console.error("Garden GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    // Validation
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!action || !["plant", "water", "sunlight", "harvest", "remove"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Valid action is required: plant, water, sunlight, harvest, or remove" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "plant": {
        const { plantTypeId, gridX, gridY } = body;
        
        if (typeof plantTypeId !== "number") {
          return NextResponse.json(
            { success: false, error: "plantTypeId is required" },
            { status: 400 }
          );
        }
        
        if (typeof gridX !== "number" || typeof gridY !== "number") {
          return NextResponse.json(
            { success: false, error: "gridX and gridY are required" },
            { status: 400 }
          );
        }

        result = await gardenManager.plantSeed(userId, plantTypeId, gridX, gridY);
        break;
      }

      case "water": {
        const { plantId } = body;
        
        if (!plantId || typeof plantId !== "string") {
          return NextResponse.json(
            { success: false, error: "plantId is required" },
            { status: 400 }
          );
        }

        result = await gardenManager.waterPlant(userId, plantId);
        break;
      }

      case "sunlight": {
        const { plantId, amount } = body;
        
        if (!plantId || typeof plantId !== "string") {
          return NextResponse.json(
            { success: false, error: "plantId is required" },
            { status: 400 }
          );
        }
        
        if (typeof amount !== "number" || amount <= 0) {
          return NextResponse.json(
            { success: false, error: "Valid amount is required" },
            { status: 400 }
          );
        }

        result = await gardenManager.addSunlight(userId, plantId, amount);
        break;
      }

      case "harvest": {
        const { plantId } = body;
        
        if (!plantId || typeof plantId !== "string") {
          return NextResponse.json(
            { success: false, error: "plantId is required" },
            { status: 400 }
          );
        }

        result = await gardenManager.harvestPlant(userId, plantId);
        break;
      }

      case "remove": {
        const { plantId } = body;
        
        if (!plantId || typeof plantId !== "string") {
          return NextResponse.json(
            { success: false, error: "plantId is required" },
            { status: 400 }
          );
        }

        result = await gardenManager.removePlant(userId, plantId);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Garden POST API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
