import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all users eligible for credit refresh
 * Eligible = has lifetime plan + 30+ days since last refresh
 */
export const getEligibleUsersForRefresh = query({
    handler: async (ctx) => {
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const allUsers = await ctx.db.query("users").collect();

        const eligibleUsers = allUsers.filter((user) => {
            // Must have a lifetime plan
            if (!user.lifetimePlan) return false;

            // Check if 30 days have passed
            const lastRefresh =
                user.creditsLastRefreshedAt ||
                user.lifetimePlanPurchasedAt ||
                user.createdAt;
            return lastRefresh <= thirtyDaysAgo;
        });

        return eligibleUsers.map((user) => ({
            userId: user._id,
            clerkId: user.clerkId,
            email: user.email,
            lifetimePlan: user.lifetimePlan,
            lastRefresh:
                user.creditsLastRefreshedAt || user.lifetimePlanPurchasedAt,
            daysSinceRefresh: Math.floor(
                (now -
                    (user.creditsLastRefreshedAt ||
                        user.lifetimePlanPurchasedAt ||
                        user.createdAt)) /
                    (1000 * 60 * 60 * 24),
            ),
        }));
    },
});

/**
 * Mutation to refresh credits for a specific user
 */
export const refreshUserCredits = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            return { success: false, reason: "User not found" };
        }

        // Check if user has a lifetime plan
        if (!user.lifetimePlan) {
            return { success: false, reason: "No lifetime plan" };
        }

        const now = Date.now();
        const lastRefresh =
            user.creditsLastRefreshedAt ||
            user.lifetimePlanPurchasedAt ||
            user.createdAt;
        const daysSinceRefresh = (now - lastRefresh) / (1000 * 60 * 60 * 24);

        // Only refresh if it's been at least 30 days
        if (daysSinceRefresh < 30) {
            return {
                success: false,
                reason: "Too soon",
                daysUntilRefresh: Math.ceil(30 - daysSinceRefresh),
            };
        }

        // Determine credits based on lifetime plan
        let creditsToAdd = 0;
        if (user.lifetimePlan === "basic") {
            creditsToAdd = 20;
        } else if (user.lifetimePlan === "premium") {
            creditsToAdd = 100;
        } else {
            return { success: false, reason: "Invalid lifetime plan" };
        }

        // Add credits
        const currentCredits = user.credits || 0;
        await ctx.db.patch(userId, {
            credits: currentCredits + creditsToAdd,
            creditsLastRefreshedAt: now,
            updatedAt: now,
        });

        return {
            success: true,
            creditsAdded: creditsToAdd,
            newTotal: currentCredits + creditsToAdd,
            plan: user.lifetimePlan,
            email: user.email,
        };
    },
});

/**
 * Batch refresh all eligible users (for cron job)
 * Call this daily to automatically refresh credits
 */
export const batchRefreshCredits = mutation({
    handler: async (ctx) => {
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const allUsers = await ctx.db.query("users").collect();

        const results = {
            total: 0,
            refreshed: 0,
            skipped: 0,
            errors: [] as Array<{ email: string; reason: string }>,
        };

        for (const user of allUsers) {
            // Skip if no lifetime plan
            if (!user.lifetimePlan) continue;

            results.total++;

            // Check if eligible for refresh
            const lastRefresh =
                user.creditsLastRefreshedAt ||
                user.lifetimePlanPurchasedAt ||
                user.createdAt;
            if (lastRefresh > thirtyDaysAgo) {
                results.skipped++;
                continue;
            }

            // Determine credits
            let creditsToAdd = 0;
            if (user.lifetimePlan === "basic") {
                creditsToAdd = 20;
            } else if (user.lifetimePlan === "premium") {
                creditsToAdd = 100;
            } else {
                results.errors.push({
                    email: user.email,
                    reason: `Invalid plan: ${user.lifetimePlan}`,
                });
                continue;
            }

            try {
                // Add credits
                const currentCredits = user.credits || 0;
                await ctx.db.patch(user._id, {
                    credits: currentCredits + creditsToAdd,
                    creditsLastRefreshedAt: now,
                    updatedAt: now,
                });

                results.refreshed++;
            } catch (error) {
                results.errors.push({
                    email: user.email,
                    reason: `Error: ${error}`,
                });
            }
        }

        return results;
    },
});
