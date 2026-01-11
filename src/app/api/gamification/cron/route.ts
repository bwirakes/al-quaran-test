/**
 * Cron API Route
 * 
 * Daily maintenance tasks for the gamification system.
 * Should be called by a cron job (e.g., Vercel Cron) once per day.
 * 
 * Tasks:
 * 1. Wither plants that haven't been watered in 48+ hours
 * 2. Future: Reset daily limits, process achievements, etc.
 * 
 * GET /api/gamification/cron
 * Headers: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { updateGardenState } from "@/lib/gamification";

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is set, allow in development
  if (!cronSecret && process.env.NODE_ENV === "development") {
    return true;
  }

  if (!cronSecret) {
    console.warn("CRON_SECRET not set - rejecting cron request");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("🌿 Starting daily garden maintenance...");

    // Run garden state update (withering logic)
    const gardenResult = await updateGardenState();

    console.log(`✅ Garden maintenance complete: ${gardenResult.witheredCount} plants withered`);

    // Future tasks can be added here:
    // - Reset daily sharing limits
    // - Process pending achievements
    // - Send reminder notifications
    // - Generate daily analytics

    return NextResponse.json({
      success: true,
      data: {
        garden: {
          witheredCount: gardenResult.witheredCount,
          processedAt: gardenResult.processedAt.toISOString(),
        },
        // Add more task results here
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual trigger or Vercel Cron
 * Vercel Cron can use either GET or POST
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * Vercel Cron configuration
 * Add this to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/gamification/cron",
 *     "schedule": "0 0 * * *"  // Daily at midnight UTC
 *   }]
 * }
 */
