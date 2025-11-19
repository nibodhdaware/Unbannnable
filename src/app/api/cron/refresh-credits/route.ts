import { NextRequest, NextResponse } from "next/server";

/**
 * API route for cron job to refresh monthly credits
 *
 * Usage:
 * 1. Set up a cron job (e.g., Vercel Cron, GitHub Actions, or external service)
 * 2. Call this endpoint daily: POST /api/cron/refresh-credits
 * 3. Include CRON_SECRET in Authorization header for security
 *
 * Example cron setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/refresh-credits",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Import Convex client
        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("../../../../../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        // Run batch refresh
        const results = await client.mutation(
            api.creditRefresh.batchRefreshCredits,
        );

        return NextResponse.json({
            success: true,
            message: "Credit refresh completed",
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error in credit refresh cron:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

// Allow GET for testing (remove in production)
export async function GET(request: NextRequest) {
    try {
        // Import Convex client
        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("../../../../../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        // Get eligible users (for testing/monitoring)
        const eligibleUsers = await client.query(
            api.creditRefresh.getEligibleUsersForRefresh,
        );

        return NextResponse.json({
            success: true,
            eligibleCount: eligibleUsers.length,
            eligibleUsers,
            message:
                "Use POST method to actually refresh credits. This endpoint is for testing only.",
        });
    } catch (error) {
        console.error("Error checking eligible users:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
