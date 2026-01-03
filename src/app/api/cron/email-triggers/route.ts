import { NextRequest, NextResponse } from "next/server";

/**
 * Cron job endpoint for processing email triggers
 * Schedule: Daily at 9:00 AM UTC (or configure in vercel.json)
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

        console.log("Starting email trigger processing...");

        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("@/../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        // Get eligible users for each email type
        const [
            welcomeUsers,
            nudgeUsers,
            reinforcementUsers,
            upgradeUsers,
            reEngagementUsers,
        ] = await Promise.all([
            client
                .query(api.emails.getUsersForWelcomeEmail as any)
                .catch(() => []),
            client
                .query(api.emails.getUsersForFirstUseNudge as any)
                .catch(() => []),
            client
                .query(api.emails.getUsersForValueReinforcement as any)
                .catch(() => []),
            client
                .query(api.emails.getUsersForUpgradePrompt as any)
                .catch(() => []),
            client
                .query(api.emails.getUsersForReEngagement as any)
                .catch(() => []),
        ]);

        const results = {
            welcome: { eligible: welcomeUsers.length, sent: 0, failed: 0 },
            first_use_nudge: {
                eligible: nudgeUsers.length,
                sent: 0,
                failed: 0,
            },
            value_reinforcement: {
                eligible: reinforcementUsers.length,
                sent: 0,
                failed: 0,
            },
            upgrade_prompt: {
                eligible: upgradeUsers.length,
                sent: 0,
                failed: 0,
            },
            re_engagement: {
                eligible: reEngagementUsers.length,
                sent: 0,
                failed: 0,
            },
        };

        // Process emails via internal API calls
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // Helper function to send email
        const sendEmailRequest = async (
            emailType: string,
            userId: string,
            userData: Record<string, unknown>,
        ) => {
            try {
                const response = await fetch(`${baseUrl}/api/emails/send`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cronSecret}`,
                    },
                    body: JSON.stringify({ emailType, userId, userData }),
                });
                return await response.json();
            } catch (error) {
                console.error(`Error sending ${emailType} email:`, error);
                return { success: false };
            }
        };

        // Process welcome emails
        for (const user of welcomeUsers) {
            const result = await sendEmailRequest("welcome", user._id, {
                fullName: user.fullName,
                currentCredits: user.credits || 10,
            });
            if (result.success) {
                results.welcome.sent++;
            } else {
                results.welcome.failed++;
            }
            await new Promise((r) => setTimeout(r, 300));
        }

        // Process first use nudge emails
        for (const user of nudgeUsers) {
            const result = await sendEmailRequest("first_use_nudge", user._id, {
                fullName: user.fullName,
            });
            if (result.success) {
                results.first_use_nudge.sent++;
            } else {
                results.first_use_nudge.failed++;
            }
            await new Promise((r) => setTimeout(r, 300));
        }

        // Process value reinforcement emails
        for (const user of reinforcementUsers) {
            const result = await sendEmailRequest(
                "value_reinforcement",
                user._id,
                {
                    fullName: user.fullName,
                    postsChecked: user.postsChecked,
                },
            );
            if (result.success) {
                results.value_reinforcement.sent++;
            } else {
                results.value_reinforcement.failed++;
            }
            await new Promise((r) => setTimeout(r, 300));
        }

        // Process upgrade prompt emails
        for (const user of upgradeUsers) {
            const result = await sendEmailRequest("upgrade_prompt", user._id, {
                fullName: user.fullName,
                creditsUsed: user.creditsUsed,
                creditsRemaining: user.creditsRemaining,
            });
            if (result.success) {
                results.upgrade_prompt.sent++;
            } else {
                results.upgrade_prompt.failed++;
            }
            await new Promise((r) => setTimeout(r, 300));
        }

        // Process re-engagement emails
        for (const user of reEngagementUsers) {
            // Add bonus credits first
            try {
                await client.mutation(
                    api.emails.addReEngagementCredits as any,
                    {
                        userId: user._id,
                        credits: 10,
                    },
                );
            } catch (error) {
                console.error("Error adding bonus credits:", error);
            }

            const result = await sendEmailRequest("re_engagement", user._id, {
                fullName: user.fullName,
                daysSinceActivity: user.daysSinceActivity,
                bonusCredits: 10,
            });
            if (result.success) {
                results.re_engagement.sent++;
            } else {
                results.re_engagement.failed++;
            }
            await new Promise((r) => setTimeout(r, 300));
        }

        console.log("Email trigger processing complete:", results);

        return NextResponse.json({
            success: true,
            message: "Email triggers processed",
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error in email triggers cron:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

// GET for monitoring/testing
export async function GET(request: NextRequest) {
    try {
        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("@/../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        // Get counts of eligible users
        const eligible = await client.query(
            api.emails.getAllEligibleUsersForEmails,
        );

        return NextResponse.json({
            success: true,
            message: "Use POST to process email triggers",
            eligibleUsers: eligible.totalEligible,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error checking email triggers:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
