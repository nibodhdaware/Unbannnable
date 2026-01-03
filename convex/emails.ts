import { v } from "convex/values";
import {
    query,
    mutation,
    internalQuery,
    internalMutation,
} from "./_generated/server";

// Email types enum
export const EMAIL_TYPES = {
    WELCOME: "welcome",
    FIRST_USE_NUDGE: "first_use_nudge",
    VALUE_REINFORCEMENT: "value_reinforcement",
    UPGRADE_PROMPT: "upgrade_prompt",
    RE_ENGAGEMENT: "re_engagement",
} as const;

// ========== EMAIL EVENTS ==========

// Log an email event
export const logEmailEvent = mutation({
    args: {
        userId: v.id("users"),
        emailType: v.string(),
        status: v.string(), // "sent", "failed", "opened", "clicked"
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { userId, emailType, status, metadata }) => {
        const now = Date.now();

        const eventId = await ctx.db.insert("emailEvents", {
            userId,
            emailType,
            status,
            sentAt: now,
            openedAt: undefined,
            clickedAt: undefined,
            metadata,
        });

        // Update user's last email sent timestamp
        await ctx.db.patch(userId, {
            lastEmailSentAt: now,
            updatedAt: now,
        });

        return eventId;
    },
});

// Internal mutation for logging from actions
export const logEmailEventInternal = internalMutation({
    args: {
        userId: v.id("users"),
        emailType: v.string(),
        status: v.string(),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, { userId, emailType, status, metadata }) => {
        const now = Date.now();

        const eventId = await ctx.db.insert("emailEvents", {
            userId,
            emailType,
            status,
            sentAt: now,
            openedAt: undefined,
            clickedAt: undefined,
            metadata,
        });

        // Update user's last email sent timestamp
        await ctx.db.patch(userId, {
            lastEmailSentAt: now,
            updatedAt: now,
        });

        return eventId;
    },
});

// Update email event (for opens/clicks)
export const updateEmailEvent = mutation({
    args: {
        eventId: v.id("emailEvents"),
        openedAt: v.optional(v.number()),
        clickedAt: v.optional(v.number()),
    },
    handler: async (ctx, { eventId, openedAt, clickedAt }) => {
        const update: any = {};
        if (openedAt) update.openedAt = openedAt;
        if (clickedAt) update.clickedAt = clickedAt;

        await ctx.db.patch(eventId, update);
        return eventId;
    },
});

// Get email events for a user
export const getUserEmailEvents = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("emailEvents")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Get email stats for admin dashboard
export const getEmailStats = query({
    handler: async (ctx) => {
        const events = await ctx.db.query("emailEvents").collect();

        const stats = {
            total: events.length,
            sent: events.filter((e) => e.status === "sent").length,
            failed: events.filter((e) => e.status === "failed").length,
            opened: events.filter((e) => e.openedAt).length,
            clicked: events.filter((e) => e.clickedAt).length,
            byType: {} as Record<string, number>,
        };

        events.forEach((e) => {
            stats.byType[e.emailType] = (stats.byType[e.emailType] || 0) + 1;
        });

        return stats;
    },
});

// ========== EMAIL PREFERENCES ==========

// Update user email preferences
export const updateEmailPreferences = mutation({
    args: {
        clerkId: v.string(),
        preferences: v.object({
            allEmails: v.optional(v.boolean()),
            marketingEmails: v.optional(v.boolean()),
            criticalUpdates: v.optional(v.boolean()),
            newsletter: v.optional(v.boolean()),
            promotional: v.optional(v.boolean()),
            productUpdates: v.optional(v.boolean()),
            weeklyDigest: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, { clerkId, preferences }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        // Merge with existing preferences
        type EmailPrefs = {
            allEmails?: boolean;
            marketingEmails?: boolean;
            criticalUpdates?: boolean;
            newsletter?: boolean;
            promotional?: boolean;
            productUpdates?: boolean;
            weeklyDigest?: boolean;
        };
        const existingPrefs = (user.emailPreferences || {}) as EmailPrefs;
        const updatedPrefs = {
            allEmails: preferences.allEmails ?? existingPrefs.allEmails ?? true,
            marketingEmails:
                preferences.marketingEmails ??
                preferences.promotional ??
                existingPrefs.marketingEmails ??
                true,
            criticalUpdates:
                preferences.criticalUpdates ??
                existingPrefs.criticalUpdates ??
                true,
            newsletter:
                preferences.newsletter ?? existingPrefs.newsletter ?? true,
            promotional:
                preferences.promotional ?? existingPrefs.promotional ?? true,
            productUpdates:
                preferences.productUpdates ??
                existingPrefs.productUpdates ??
                true,
            weeklyDigest:
                preferences.weeklyDigest ?? existingPrefs.weeklyDigest ?? false,
        };

        await ctx.db.patch(user._id, {
            emailPreferences: updatedPrefs,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

// Unsubscribe user from emails
export const unsubscribeUser = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const now = Date.now();

        await ctx.db.patch(userId, {
            unsubscribedAt: now,
            emailPreferences: {
                allEmails: false,
                marketingEmails: false,
                criticalUpdates: true, // Always keep critical updates
            },
            updatedAt: now,
        });

        return userId;
    },
});

// Unsubscribe via token (for email links)
export const unsubscribeByToken = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, { token }) => {
        // Token is base64 encoded email
        try {
            const email = Buffer.from(token, "base64").toString("utf-8");

            const user = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), email))
                .first();

            if (!user) {
                return { success: false, error: "User not found" };
            }

            const now = Date.now();

            await ctx.db.patch(user._id, {
                unsubscribedAt: now,
                emailPreferences: {
                    allEmails: false,
                    marketingEmails: false,
                    criticalUpdates: true,
                },
                updatedAt: now,
            });

            return { success: true };
        } catch {
            return { success: false, error: "Invalid token" };
        }
    },
});

// Get user email preferences
export const getUserEmailPreferences = query({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            return null;
        }

        return {
            preferences: user.emailPreferences || {
                allEmails: true,
                marketingEmails: true,
                criticalUpdates: true,
            },
            unsubscribedAt: user.unsubscribedAt,
        };
    },
});

// ========== TRIGGER ELIGIBILITY QUERIES ==========

// Get users eligible for welcome email (signed up but no welcome sent)
export const getUsersForWelcomeEmail = query({
    handler: async (ctx) => {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        // Get all users created in the last 24 hours
        const recentUsers = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.gte(q.field("createdAt"), oneDayAgo),
                    q.eq(q.field("unsubscribedAt"), undefined),
                ),
            )
            .collect();

        // Filter out users who already received welcome email
        const eligibleUsers = [];
        for (const user of recentUsers) {
            const welcomeEmail = await ctx.db
                .query("emailEvents")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .filter((q) => q.eq(q.field("emailType"), "welcome"))
                .first();

            if (!welcomeEmail) {
                eligibleUsers.push(user);
            }
        }

        return eligibleUsers;
    },
});

// Get users eligible for first use nudge (Day 2, no usage)
export const getUsersForFirstUseNudge = query({
    handler: async (ctx) => {
        const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

        // Get users created 2-3 days ago
        const users = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.lte(q.field("createdAt"), twoDaysAgo),
                    q.gte(q.field("createdAt"), threeDaysAgo),
                    q.eq(q.field("unsubscribedAt"), undefined),
                ),
            )
            .collect();

        const eligibleUsers = [];
        for (const user of users) {
            // Check if user has used any credits
            const posts = await ctx.db
                .query("posts")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .collect();

            // Check if already received this email type
            const nudgeEmail = await ctx.db
                .query("emailEvents")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .filter((q) => q.eq(q.field("emailType"), "first_use_nudge"))
                .first();

            if (posts.length === 0 && !nudgeEmail) {
                eligibleUsers.push(user);
            }
        }

        return eligibleUsers;
    },
});

// Get users eligible for value reinforcement (Day 5, 5+ credits used)
export const getUsersForValueReinforcement = query({
    handler: async (ctx) => {
        const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
        const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;

        const users = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.lte(q.field("createdAt"), fiveDaysAgo),
                    q.gte(q.field("createdAt"), sixDaysAgo),
                    q.eq(q.field("unsubscribedAt"), undefined),
                ),
            )
            .collect();

        const eligibleUsers = [];
        for (const user of users) {
            // Check post count
            const posts = await ctx.db
                .query("posts")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .collect();

            // Check if already received this email
            const reinforcementEmail = await ctx.db
                .query("emailEvents")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .filter((q) =>
                    q.eq(q.field("emailType"), "value_reinforcement"),
                )
                .first();

            if (posts.length >= 5 && !reinforcementEmail) {
                eligibleUsers.push({ ...user, postsChecked: posts.length });
            }
        }

        return eligibleUsers;
    },
});

// Get users eligible for upgrade prompt (Day 7, >50% credits used)
export const getUsersForUpgradePrompt = query({
    handler: async (ctx) => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;

        const users = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.lte(q.field("createdAt"), sevenDaysAgo),
                    q.gte(q.field("createdAt"), eightDaysAgo),
                    q.eq(q.field("unsubscribedAt"), undefined),
                    q.eq(q.field("lifetimePlan"), undefined), // Free tier only
                ),
            )
            .collect();

        const eligibleUsers = [];
        for (const user of users) {
            // Check if used more than 50% of initial credits (10)
            const initialCredits = 10;
            const currentCredits = user.credits || 0;
            const usedCredits = initialCredits - currentCredits;

            // Check if already received this email
            const upgradeEmail = await ctx.db
                .query("emailEvents")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .filter((q) => q.eq(q.field("emailType"), "upgrade_prompt"))
                .first();

            if (usedCredits > initialCredits * 0.5 && !upgradeEmail) {
                eligibleUsers.push({
                    ...user,
                    creditsUsed: usedCredits,
                    creditsRemaining: currentCredits,
                });
            }
        }

        return eligibleUsers;
    },
});

// Get users eligible for re-engagement (Day 14, inactive 7+ days)
export const getUsersForReEngagement = query({
    handler: async (ctx) => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const twentyOneDaysAgo = Date.now() - 21 * 24 * 60 * 60 * 1000;

        const users = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.lte(q.field("createdAt"), fourteenDaysAgo),
                    q.gte(q.field("createdAt"), twentyOneDaysAgo),
                    q.eq(q.field("unsubscribedAt"), undefined),
                ),
            )
            .collect();

        const eligibleUsers = [];
        for (const user of users) {
            // Check last activity (most recent post)
            const recentPosts = await ctx.db
                .query("posts")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .order("desc")
                .first();

            const lastActivity = recentPosts?.createdAt || user.createdAt;
            const isInactive = lastActivity < sevenDaysAgo;

            // Check if already received this email recently (within 14 days)
            const reEngagementEmails = await ctx.db
                .query("emailEvents")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .filter((q) =>
                    q.and(
                        q.eq(q.field("emailType"), "re_engagement"),
                        q.gte(q.field("sentAt"), fourteenDaysAgo),
                    ),
                )
                .first();

            if (isInactive && !reEngagementEmails) {
                eligibleUsers.push({
                    ...user,
                    daysSinceActivity: Math.floor(
                        (Date.now() - lastActivity) / (1000 * 60 * 60 * 24),
                    ),
                });
            }
        }

        return eligibleUsers;
    },
});

// Add bonus credits for re-engagement email
export const addReEngagementCredits = mutation({
    args: {
        userId: v.id("users"),
        credits: v.number(),
    },
    handler: async (ctx, { userId, credits }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const currentCredits = user.credits || 0;
        await ctx.db.patch(userId, {
            credits: currentCredits + credits,
            updatedAt: Date.now(),
        });

        return currentCredits + credits;
    },
});

// Get all eligible users for email triggers (combined query for efficiency)
export const getAllEligibleUsersForEmails = query({
    handler: async (ctx) => {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        // Get all users who haven't been emailed in the last 24 hours
        const allUsers = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.eq(q.field("unsubscribedAt"), undefined),
                    q.or(
                        q.eq(q.field("lastEmailSentAt"), undefined),
                        q.lt(q.field("lastEmailSentAt"), oneDayAgo),
                    ),
                ),
            )
            .collect();

        return {
            totalEligible: allUsers.length,
            users: allUsers.map((u) => ({
                id: u._id,
                email: u.email,
                createdAt: u.createdAt,
                credits: u.credits,
                lifetimePlan: u.lifetimePlan,
                lastEmailSentAt: u.lastEmailSentAt,
            })),
        };
    },
});

// Get user stats for personalization
export const getUserStatsForPersonalization = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) return null;

        // Get all posts for this user
        const posts = await ctx.db
            .query("posts")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();

        // Calculate stats
        const subreddits = posts
            .map((p) => p.subreddit)
            .filter(Boolean) as string[];
        const subredditCounts = subreddits.reduce(
            (acc, sub) => {
                acc[sub] = (acc[sub] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        const topSubreddits = Object.entries(subredditCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([sub]) => sub);

        // Analyze posting times
        const postHours = posts.map((p) => new Date(p.createdAt).getHours());
        const hourCounts = postHours.reduce(
            (acc, hour) => {
                acc[hour] = (acc[hour] || 0) + 1;
                return acc;
            },
            {} as Record<number, number>,
        );

        const peakHour = Object.entries(hourCounts).sort(
            ([, a], [, b]) => b - a,
        )[0]?.[0];

        // Determine user type
        const isPowerUser = posts.length >= 10;
        const isActiveUser = posts.length >= 5;

        return {
            totalPostsChecked: posts.length,
            topSubreddits,
            peakHour: peakHour ? parseInt(peakHour) : null,
            isPowerUser,
            isActiveUser,
            currentCredits: user.credits || 0,
            hasLifetimePlan: !!user.lifetimePlan,
            lifetimePlan: user.lifetimePlan,
            daysSinceSignup: Math.floor(
                (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24),
            ),
            fullName: user.fullName,
        };
    },
});

// ========== EMAIL CONTENT CACHE ==========

// Get cached personalized content
export const getCachedEmailContent = query({
    args: {
        userId: v.id("users"),
        emailType: v.string(),
    },
    handler: async (ctx, { userId, emailType }) => {
        const now = Date.now();

        const cached = await ctx.db
            .query("emailContentCache")
            .withIndex("by_user_and_type", (q) =>
                q.eq("userId", userId).eq("emailType", emailType),
            )
            .first();

        // Return null if expired or not found
        if (!cached || cached.expiresAt < now) {
            return null;
        }

        return {
            content: cached.personalizedContent,
            generatedAt: cached.generatedAt,
            expiresAt: cached.expiresAt,
        };
    },
});

// Save personalized content to cache
export const cacheEmailContent = mutation({
    args: {
        userId: v.id("users"),
        emailType: v.string(),
        personalizedContent: v.string(),
    },
    handler: async (ctx, { userId, emailType, personalizedContent }) => {
        const now = Date.now();
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

        // Check for existing cache entry
        const existing = await ctx.db
            .query("emailContentCache")
            .withIndex("by_user_and_type", (q) =>
                q.eq("userId", userId).eq("emailType", emailType),
            )
            .first();

        if (existing) {
            // Update existing cache
            await ctx.db.patch(existing._id, {
                personalizedContent,
                generatedAt: now,
                expiresAt: now + CACHE_DURATION,
            });
            return existing._id;
        } else {
            // Create new cache entry
            return await ctx.db.insert("emailContentCache", {
                userId,
                emailType,
                personalizedContent,
                generatedAt: now,
                expiresAt: now + CACHE_DURATION,
            });
        }
    },
});

// Clear expired cache entries (run periodically)
export const clearExpiredCache = mutation({
    handler: async (ctx) => {
        const now = Date.now();

        const expired = await ctx.db
            .query("emailContentCache")
            .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
            .collect();

        let deleted = 0;
        for (const entry of expired) {
            await ctx.db.delete(entry._id);
            deleted++;
        }

        return { deleted };
    },
});

// ========== ADMIN QUERIES ==========

// Get recent email events for admin
export const getRecentEmailEvents = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { limit = 50 }) => {
        const events = await ctx.db
            .query("emailEvents")
            .withIndex("by_sent_at")
            .order("desc")
            .take(limit);

        // Enrich with user info
        const enrichedEvents = await Promise.all(
            events.map(async (event) => {
                const user = await ctx.db.get(event.userId);
                return {
                    ...event,
                    userEmail: user?.email,
                    userName: user?.fullName,
                };
            }),
        );

        return enrichedEvents;
    },
});

// Get email funnel stats
export const getEmailFunnelStats = query({
    handler: async (ctx) => {
        const events = await ctx.db.query("emailEvents").collect();

        const stats: Record<
            string,
            { sent: number; opened: number; clicked: number }
        > = {};

        events.forEach((event) => {
            if (!stats[event.emailType]) {
                stats[event.emailType] = { sent: 0, opened: 0, clicked: 0 };
            }

            if (event.status === "sent") {
                stats[event.emailType].sent++;
            }
            if (event.openedAt) {
                stats[event.emailType].opened++;
            }
            if (event.clickedAt) {
                stats[event.emailType].clicked++;
            }
        });

        return stats;
    },
});
