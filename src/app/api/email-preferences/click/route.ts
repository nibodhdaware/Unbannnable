import { NextRequest, NextResponse } from "next/server";

/**
 * Track email link clicks and redirect
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("u");
        const emailType = searchParams.get("t");
        const redirectUrl = searchParams.get("r");

        if (!redirectUrl) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        if (userId && emailType) {
            // Log the click event asynchronously
            logClickEvent(userId, emailType).catch(console.error);
        }

        // Redirect to the original URL
        return NextResponse.redirect(decodeURIComponent(redirectUrl));
    } catch (error) {
        console.error("Error tracking email click:", error);
        // Fallback redirect to home
        return NextResponse.redirect(new URL("/", request.url));
    }
}

async function logClickEvent(userId: string, emailType: string) {
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
            (e: any) => e.emailType === emailType && !e.clickedAt,
        );

        if (matchingEvent) {
            await client.mutation(api.emails.updateEmailEvent, {
                eventId: matchingEvent._id,
                clickedAt: Date.now(),
                // Also mark as opened if not already
                openedAt: matchingEvent.openedAt || Date.now(),
            });
            console.log(`Email click tracked: ${emailType} for user ${userId}`);
        }
    } catch (error) {
        console.error("Error logging click event:", error);
    }
}
