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
        credits: v.optional(v.number()), // Current credit balance
        
        // Referral system
        referralCode: v.optional(v.string()),
        referredBy: v.optional(v.string()),
        referralCount: v.optional(v.number()),
        hasReceivedSignupBonus: v.optional(v.boolean()),
        
        // Lifetime plan
        lifetimePlan: v.optional(v.string()), // "basic" or "premium"
        lifetimePlanPurchasedAt: v.optional(v.number()),
        creditsLastRefreshedAt: v.optional(v.number()),
        
        // DEPRECATED - kept for backward compatibility with old data (will be removed after migration)
        role: v.optional(v.string()),
        totalPurchasedPosts: v.optional(v.number()),
        lastMonthlyRefreshDate: v.optional(v.number()),
        lifetimePlanPurchaseDate: v.optional(v.number()),
        freePostsUsed: v.optional(v.number()),
        unlimitedMonthlyExpiry: v.optional(v.number()),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_referral_code", ["referralCode"]),

    posts: defineTable({
        // Core post data
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
        status: v.optional(v.string()), // "posted", "failed", "pending"
        createdAt: v.number(),
        
        // DEPRECATED - kept for backward compatibility with old data
        postType: v.optional(v.string()), // Old field - will be removed after data cleanup
        
        // AI features tracking
        aiFeaturesUsed: v.optional(v.array(v.string())), // e.g., ["AI Post Analyzer", "Rule Checker"]
        totalCreditsSpent: v.optional(v.number()), // Total credits spent on AI features for this post
        aiAnalysisResults: v.optional(
            v.object({
                postAnalyzer: v.optional(v.string()),
                ruleChecker: v.optional(v.string()),
                betterSubreddits: v.optional(v.array(v.string())),
                anomalyDetection: v.optional(v.string()),
                flairSuggestions: v.optional(v.array(v.string())),
            }),
        ),
    })
        .index("by_user_id", ["userId"])
        .index("by_user_and_date", ["userId", "createdAt"]),
});
