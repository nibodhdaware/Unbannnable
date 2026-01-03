import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        // Core identity
        clerkId: v.string(),
        email: v.string(),
        fullName: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),

        // Admin access
        isAdmin: v.optional(v.boolean()),

        // Credits
        credits: v.optional(v.number()),

        // Referral system
        referralCode: v.optional(v.string()),
        referredBy: v.optional(v.string()),
        referralCount: v.optional(v.number()),
        hasReceivedSignupBonus: v.optional(v.boolean()),

        // Lifetime plan
        lifetimePlan: v.optional(v.string()),
        lifetimePlanPurchasedAt: v.optional(v.number()),
        creditsLastRefreshedAt: v.optional(v.number()),

        // Email preferences
        emailPreferences: v.optional(
            v.object({
                allEmails: v.optional(v.boolean()),
                marketingEmails: v.optional(v.boolean()),
                criticalUpdates: v.optional(v.boolean()),
                newsletter: v.optional(v.boolean()),
                promotional: v.optional(v.boolean()),
                productUpdates: v.optional(v.boolean()),
                weeklyDigest: v.optional(v.boolean()),
            }),
        ),
        lastEmailSentAt: v.optional(v.number()),
        unsubscribedAt: v.optional(v.number()),

        // Legacy fields - kept for data compatibility (not used in new code)
        role: v.optional(v.string()),
        totalPurchasedPosts: v.optional(v.number()),
        lastMonthlyRefreshDate: v.optional(v.number()),
        lifetimePlanPurchaseDate: v.optional(v.number()),
        freePostsUsed: v.optional(v.number()),
        unlimitedMonthlyExpiry: v.optional(v.number()),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_referral_code", ["referralCode"])
        .index("by_email", ["email"]),

    posts: defineTable({
        // Core post data
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
        status: v.optional(v.string()),
        createdAt: v.number(),
        postType: v.optional(v.string()), // Legacy field - not used in new code

        // AI features tracking
        aiFeaturesUsed: v.optional(v.array(v.string())),
        totalCreditsSpent: v.optional(v.number()),
        aiAnalysisResults: v.optional(
            v.object({
                postAnalyzer: v.optional(v.string()),
                ruleChecker: v.optional(v.string()),
                // Support both array (legacy) and string (new) formats
                betterSubreddits: v.optional(
                    v.union(v.string(), v.array(v.string())),
                ),
                anomalyDetection: v.optional(v.string()),
                flairSuggestions: v.optional(v.array(v.string())),
            }),
        ),
    })
        .index("by_user_id", ["userId"])
        .index("by_user_and_date", ["userId", "createdAt"]),

    // Email events tracking
    emailEvents: defineTable({
        userId: v.id("users"),
        emailType: v.string(),
        status: v.string(),
        sentAt: v.number(),
        openedAt: v.optional(v.number()),
        clickedAt: v.optional(v.number()),
        metadata: v.optional(v.any()),
    })
        .index("by_user_id", ["userId"])
        .index("by_email_type", ["emailType"])
        .index("by_sent_at", ["sentAt"]),

    // Email content cache (for AI-generated personalized content)
    emailContentCache: defineTable({
        userId: v.id("users"),
        emailType: v.string(),
        personalizedContent: v.string(),
        generatedAt: v.number(),
        expiresAt: v.number(),
    })
        .index("by_user_and_type", ["userId", "emailType"])
        .index("by_expires_at", ["expiresAt"]),
});
