import { NextRequest, NextResponse } from "next/server";
import { sendEmailByType, EmailType, UserStats } from "@/lib/email";

/**
 * API route for sending emails
 * Called by Convex actions
 */
export async function POST(request: NextRequest) {
    try {
        // Verify authorization
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { emailType, userId, userData, testMode } = body as {
            emailType: EmailType;
            userId: string;
            userData: {
                fullName?: string;
                currentCredits?: number;
                totalPostsChecked?: number;
                topSubreddits?: string[];
                peakHour?: number | null;
                isPowerUser?: boolean;
                isActiveUser?: boolean;
                hasLifetimePlan?: boolean;
                lifetimePlan?: string;
                daysSinceSignup?: number;
                postsChecked?: number;
                creditsUsed?: number;
                creditsRemaining?: number;
                daysSinceActivity?: number;
                bonusCredits?: number;
            };
            testMode?: boolean;
        };

        if (!emailType || !userId || !userData) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Get user email from Convex
        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("@/../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        // We need to get the user by ID - construct the user object
        // In a real scenario, you'd fetch this from Convex
        const userStats: UserStats = {
            totalPostsChecked: userData.totalPostsChecked || 0,
            topSubreddits: userData.topSubreddits || [],
            peakHour: userData.peakHour ?? null,
            isPowerUser: userData.isPowerUser || false,
            isActiveUser: userData.isActiveUser || false,
            currentCredits: userData.currentCredits || 0,
            hasLifetimePlan: userData.hasLifetimePlan || false,
            lifetimePlan: userData.lifetimePlan,
            daysSinceSignup: userData.daysSinceSignup || 0,
            fullName: userData.fullName,
        };

        // For testing, we need an email - get it from the user data or use test email
        let userEmail = process.env.EMAIL_TEST_RECIPIENT || "";

        // In production, fetch the actual user email from Convex
        if (!testMode && process.env.EMAIL_TEST_MODE !== "true") {
            try {
                // This would need the actual user lookup
                // For now, use the test email as fallback
                const user = await client.query(api.users.getUser, {
                    id: userId as any,
                });
                if (user) {
                    userEmail = user.email;
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        }

        if (!userEmail) {
            return NextResponse.json(
                { success: false, error: "No email address available" },
                { status: 400 },
            );
        }

        // Send the email
        const result = await sendEmailByType(emailType, {
            _id: userId,
            email: userEmail,
            fullName: userData.fullName,
            credits: userData.currentCredits,
            createdAt:
                Date.now() -
                (userData.daysSinceSignup || 0) * 24 * 60 * 60 * 1000,
            stats: userStats,
            postsChecked: userData.postsChecked,
            creditsUsed: userData.creditsUsed,
            creditsRemaining: userData.creditsRemaining,
            daysSinceActivity: userData.daysSinceActivity,
            bonusCredits: userData.bonusCredits,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in email send API:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
