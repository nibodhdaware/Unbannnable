import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Audience IDs - these should be created in Resend dashboard
// and stored as environment variables
const NEWSLETTER_AUDIENCE_ID = process.env.RESEND_NEWSLETTER_AUDIENCE_ID;
const PROMOTIONAL_AUDIENCE_ID = process.env.RESEND_PROMOTIONAL_AUDIENCE_ID;

/**
 * Subscribe user to email audiences
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, email, fullName, newsletter, promotional } = body as {
            userId: string;
            email: string;
            fullName?: string;
            newsletter: boolean;
            promotional: boolean;
        };

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 },
            );
        }

        const results: {
            newsletter?: { success: boolean; error?: string };
            promotional?: { success: boolean; error?: string };
        } = {};

        // Add to Newsletter audience
        if (newsletter && NEWSLETTER_AUDIENCE_ID) {
            try {
                await resend.contacts.create({
                    audienceId: NEWSLETTER_AUDIENCE_ID,
                    email,
                    firstName: fullName?.split(" ")[0] || "",
                    lastName: fullName?.split(" ").slice(1).join(" ") || "",
                    unsubscribed: false,
                });
                results.newsletter = { success: true };
            } catch (error: any) {
                // If contact already exists, try to update
                if (error?.message?.includes("already exists")) {
                    results.newsletter = { success: true };
                } else {
                    console.error(
                        "Error adding to newsletter audience:",
                        error,
                    );
                    results.newsletter = {
                        success: false,
                        error: error?.message,
                    };
                }
            }
        } else if (!newsletter && NEWSLETTER_AUDIENCE_ID) {
            // Remove from newsletter audience
            try {
                await resend.contacts.remove({
                    audienceId: NEWSLETTER_AUDIENCE_ID,
                    email,
                });
                results.newsletter = { success: true };
            } catch (error: any) {
                // Ignore if contact doesn't exist
                results.newsletter = { success: true };
            }
        }

        // Add to Promotional audience
        if (promotional && PROMOTIONAL_AUDIENCE_ID) {
            try {
                await resend.contacts.create({
                    audienceId: PROMOTIONAL_AUDIENCE_ID,
                    email,
                    firstName: fullName?.split(" ")[0] || "",
                    lastName: fullName?.split(" ").slice(1).join(" ") || "",
                    unsubscribed: false,
                });
                results.promotional = { success: true };
            } catch (error: any) {
                if (error?.message?.includes("already exists")) {
                    results.promotional = { success: true };
                } else {
                    console.error(
                        "Error adding to promotional audience:",
                        error,
                    );
                    results.promotional = {
                        success: false,
                        error: error?.message,
                    };
                }
            }
        } else if (!promotional && PROMOTIONAL_AUDIENCE_ID) {
            // Remove from promotional audience
            try {
                await resend.contacts.remove({
                    audienceId: PROMOTIONAL_AUDIENCE_ID,
                    email,
                });
                results.promotional = { success: true };
            } catch (error: any) {
                results.promotional = { success: true };
            }
        }

        // Also update user preferences in Convex
        try {
            const { ConvexHttpClient } = await import("convex/browser");
            const { api } = await import("@/../convex/_generated/api");

            const client = new ConvexHttpClient(
                process.env.NEXT_PUBLIC_CONVEX_URL!,
            );

            await client.mutation(api.emails.updateEmailPreferences, {
                clerkId: userId,
                preferences: {
                    newsletter,
                    promotional,
                    productUpdates: newsletter, // Map newsletter to product updates
                    weeklyDigest: false,
                },
            });
        } catch (error) {
            console.error("Error updating Convex preferences:", error);
            // Don't fail the request if Convex update fails
        }

        return NextResponse.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error("Error in subscribe endpoint:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
