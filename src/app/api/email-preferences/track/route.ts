import { NextRequest, NextResponse } from "next/server";

/**
 * Track email opens via tracking pixel
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("u");
        const emailType = searchParams.get("t");

        if (userId && emailType) {
            // Log the open event asynchronously
            logOpenEvent(userId, emailType).catch(console.error);
        }

        // Return a 1x1 transparent pixel
        const pixel = Buffer.from(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            "base64",
        );

        return new NextResponse(pixel, {
            status: 200,
            headers: {
                "Content-Type": "image/gif",
                "Cache-Control":
                    "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch (error) {
        console.error("Error tracking email open:", error);
        // Still return the pixel even on error
        const pixel = Buffer.from(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            "base64",
        );
        return new NextResponse(pixel, {
            status: 200,
            headers: { "Content-Type": "image/gif" },
        });
    }
}

async function logOpenEvent(userId: string, emailType: string) {
    try {
        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("@/../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        // Find the most recent email event for this user/type and update it
        const events = await client.query(api.emails.getUserEmailEvents, {
            userId: userId as any,
        });

        const matchingEvent = events.find(
            (e: any) => e.emailType === emailType && !e.openedAt,
        );

        if (matchingEvent) {
            await client.mutation(api.emails.updateEmailEvent, {
                eventId: matchingEvent._id,
                openedAt: Date.now(),
            });
            console.log(`Email open tracked: ${emailType} for user ${userId}`);
        }
    } catch (error) {
        console.error("Error logging open event:", error);
    }
}
