import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Get email preferences for authenticated user
 */
export async function GET() {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("@/../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        const preferences = await client.query(
            api.emails.getUserEmailPreferences,
            { clerkId },
        );

        return NextResponse.json({
            success: true,
            preferences: preferences?.preferences || {
                allEmails: true,
                marketingEmails: true,
                criticalUpdates: true,
            },
            unsubscribedAt: preferences?.unsubscribedAt,
        });
    } catch (error) {
        console.error("Error fetching email preferences:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

/**
 * Update email preferences for authenticated user
 */
export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { preferences } = body as {
            preferences: {
                allEmails: boolean;
                marketingEmails: boolean;
                criticalUpdates: boolean;
            };
        };

        if (!preferences) {
            return NextResponse.json(
                { success: false, error: "Preferences required" },
                { status: 400 },
            );
        }

        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("@/../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        await client.mutation(api.emails.updateEmailPreferences, {
            clerkId,
            preferences,
        });

        return NextResponse.json({
            success: true,
            preferences,
        });
    } catch (error) {
        console.error("Error updating email preferences:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
