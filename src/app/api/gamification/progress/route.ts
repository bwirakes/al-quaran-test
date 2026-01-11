/**
 * Progress API Route
 * 
 * Records reading progress and awards seeds/XP to users.
 * 
 * POST /api/gamification/progress
 * Body: { userId, surahId, versesRead, durationSeconds?, scrollDepth? }
 */

import { NextRequest, NextResponse } from "next/server";
import { gamificationEngine } from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, surahId, versesRead, durationSeconds, scrollDepth } = body;

    // Validation
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!surahId || typeof surahId !== "number" || surahId < 1 || surahId > 114) {
      return NextResponse.json(
        { success: false, error: "Valid surahId (1-114) is required" },
        { status: 400 }
      );
    }

    if (!versesRead || !Array.isArray(versesRead) || versesRead.length === 0) {
      return NextResponse.json(
        { success: false, error: "versesRead array is required" },
        { status: 400 }
      );
    }

    // Record progress
    const result = await gamificationEngine.recordReadingProgress(
      userId,
      surahId,
      versesRead,
      durationSeconds,
      scrollDepth
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gamification/progress?userId=xxx
 * 
 * Get user's current progress across all nodes
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
      data: profile,
    });
  } catch (error) {
    console.error("Progress GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
