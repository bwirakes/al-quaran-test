/**
 * Check-in API Route
 * 
 * Handles daily check-ins and prayer confirmations.
 * Awards water based on prayers confirmed.
 * 
 * POST /api/gamification/checkin
 * Body: { userId, prayers?: ["fajr", "dhuhr", ...] }
 */

import { NextRequest, NextResponse } from "next/server";
import { gamificationEngine, type PrayerName } from "@/lib/gamification";

const VALID_PRAYERS: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, prayers } = body;

    // Validation
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Validate prayers array if provided
    let validatedPrayers: PrayerName[] | undefined;
    if (prayers) {
      if (!Array.isArray(prayers)) {
        return NextResponse.json(
          { success: false, error: "prayers must be an array" },
          { status: 400 }
        );
      }

      // Filter to only valid prayer names
      validatedPrayers = prayers.filter((p): p is PrayerName => 
        VALID_PRAYERS.includes(p as PrayerName)
      );
    }

    // Process check-in
    const result = await gamificationEngine.processCheckin(userId, validatedPrayers);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Check-in API error:", error);
    
    // Handle specific errors
    if (error instanceof Error && error.message === "User streak data not found") {
      return NextResponse.json(
        { success: false, error: "User not found or not initialized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gamification/checkin?userId=xxx
 * 
 * Get user's streak and prayer history
 */
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

    const profile = await gamificationEngine.getUserProfile(userId);

    return NextResponse.json({
      success: true,
      data: {
        streak: profile.streak,
        // Include today's prayer status if available
      },
    });
  } catch (error) {
    console.error("Check-in GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
