/**
 * Share API Route
 * 
 * Awards sunlight for social sharing actions.
 * Respects daily cap on sunlight earnings.
 * 
 * POST /api/gamification/share
 * Body: { userId, shareType: "verse" | "surah" | "progress" | "achievement", contentId? }
 */

import { NextRequest, NextResponse } from "next/server";
import { gamificationEngine } from "@/lib/gamification";

const VALID_SHARE_TYPES = ["verse", "surah", "progress", "achievement"] as const;
type ShareType = (typeof VALID_SHARE_TYPES)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, shareType, contentId } = body;

    // Validation
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (!shareType || !VALID_SHARE_TYPES.includes(shareType as ShareType)) {
      return NextResponse.json(
        { success: false, error: "Valid shareType is required: verse, surah, progress, or achievement" },
        { status: 400 }
      );
    }

    // Process share action
    const result = await gamificationEngine.processShare(
      userId,
      shareType as ShareType,
      contentId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Share API error:", error);
    
    if (error instanceof Error && error.message === "User inventory not found") {
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
