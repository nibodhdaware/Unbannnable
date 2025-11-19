import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";

// Get user by Clerk ID
export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();
    },
});

// Internal query to get user by ID (for use in actions)
export const getUserByIdInternal = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db.get(userId);
    },
});

// Create or update user
export const createOrUpdateUser = mutation({
    args: {
        clerkId: v.string(),
        fullName: v.optional(v.string()),
        email: v.string(),
        isAdmin: v.optional(v.boolean()),
        referralCode: v.optional(v.string()), // Referral code from URL
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                fullName: args.fullName,
                email: args.email,
                isAdmin: args.isAdmin,
                updatedAt: now,
            });
            return existing._id;
        } else {
            // New user signup - give 10 credits bonus
            const newUserData: any = {
                clerkId: args.clerkId,
                fullName: args.fullName,
                email: args.email,
                isAdmin: args.isAdmin,
                createdAt: now,
                updatedAt: now,
                credits: 10, // 10 credits signup bonus
                hasReceivedSignupBonus: true,
            };

            // Handle referral if provided
            if (args.referralCode) {
                const referrer = await ctx.db
                    .query("users")
                    .withIndex("by_referral_code", (q) =>
                        q.eq("referralCode", args.referralCode),
                    )
                    .first();

                if (referrer) {
                    // Set who referred this user
                    newUserData.referredBy = args.referralCode;

                    // Give referrer 10 credits
                    const referrerCredits = referrer.credits || 0;
                    await ctx.db.patch(referrer._id, {
                        credits: referrerCredits + 10,
                        referralCount: (referrer.referralCount || 0) + 1,
                        updatedAt: now,
                    });

                    // Give new user 10 additional credits (20 total: 10 signup + 10 referral)
                    newUserData.credits = 20;
                }
            }

            return await ctx.db.insert("users", newUserData);
        }
    },
});

// Check if user is admin
export const isAdmin = query({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) return false;

        // Check for specific admin email or isAdmin flag
        return user.isAdmin === true || user.email === "nibod1248@gmail.com";
    },
});

// Get user by email
export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), email))
            .first();
    },
});

// Get user by ID
export const getUser = query({
    args: { id: v.id("users") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

// Update user last payment info for tracking
export const updateUserPaymentInfo = mutation({
    args: {
        userId: v.id("users"),
        lastPaymentId: v.optional(v.string()),
        lastPaymentAmount: v.optional(v.number()),
        lastPaymentDate: v.optional(v.number()),
    },
    handler: async (
        ctx,
        { userId, lastPaymentId, lastPaymentAmount, lastPaymentDate },
    ) => {
        const now = Date.now();

        // Get current user data
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Update user with payment tracking info in metadata
        await ctx.db.patch(userId, {
            updatedAt: now,
        });

        return userId;
    },
});

// Add credits to user
export const addCredits = mutation({
    args: {
        clerkId: v.string(),
        credits: v.number(),
    },
    handler: async (ctx, { clerkId, credits }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        const currentCredits = user.credits || 0;
        const newCredits = currentCredits + credits;

        await ctx.db.patch(user._id, {
            credits: newCredits,
            updatedAt: Date.now(),
        });

        return newCredits;
    },
});

// Internal mutation to deduct credits (for use in actions)
export const deductCreditsInternal = internalMutation({
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
        if (currentCredits < credits) {
            throw new Error("Insufficient credits");
        }

        const newCredits = currentCredits - credits;

        await ctx.db.patch(userId, {
            credits: newCredits,
            updatedAt: Date.now(),
        });

        return newCredits;
    },
});

// Deduct credits from user
export const deductCredits = mutation({
    args: {
        clerkId: v.string(),
        credits: v.number(),
    },
    handler: async (ctx, { clerkId, credits }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        const currentCredits = user.credits || 0;
        if (currentCredits < credits) {
            throw new Error("Insufficient credits");
        }

        const newCredits = currentCredits - credits;

        await ctx.db.patch(user._id, {
            credits: newCredits,
            updatedAt: Date.now(),
        });

        return newCredits;
    },
});

// Get user credits
export const getUserCredits = query({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            return 0;
        }

        return user.credits || 0;
    },
});

// Refresh monthly credits for lifetime plan holders
export const refreshMonthlyCredits = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        // Check if user has a lifetime plan
        if (!user.lifetimePlan) {
            return { refreshed: false, reason: "No lifetime plan" };
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
                refreshed: false,
                reason: "Too soon",
                daysUntilRefresh: Math.ceil(30 - daysSinceRefresh),
            };
        }

        // Determine credits based on lifetime plan
        let creditsToAdd = 0;
        if (user.lifetimePlan === "basic") {
            creditsToAdd = 20; // $19 one-time = 20 credits/month forever
        } else if (user.lifetimePlan === "premium") {
            creditsToAdd = 100; // $39 one-time = 100 credits/month forever
        } else {
            return { refreshed: false, reason: "Invalid lifetime plan" };
        }

        // Add credits
        const currentCredits = user.credits || 0;
        await ctx.db.patch(user._id, {
            credits: currentCredits + creditsToAdd,
            creditsLastRefreshedAt: now,
            updatedAt: now,
        });

        return {
            refreshed: true,
            creditsAdded: creditsToAdd,
            newTotal: currentCredits + creditsToAdd,
            plan: user.lifetimePlan,
        };
    },
});

// Get referral stats
export const getReferralStats = query({
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
            referralCode: user.referralCode,
            referralCount: user.referralCount || 0,
            totalEarned: (user.referralCount || 0) * 10, // 10 credits per referral
        };
    },
});

// Purchase lifetime plan and get initial credits
export const purchaseLifetimePlan = mutation({
    args: {
        clerkId: v.string(),
        amount: v.number(), // Amount in cents (1900 or 3900)
    },
    handler: async (ctx, { clerkId, amount }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        // Determine plan based on amount
        let plan: "basic" | "premium";
        let creditsToAdd: number;

        if (amount === 1900) {
            plan = "basic";
            creditsToAdd = 20; // $19 one-time = 20 credits/month
        } else if (amount === 3900) {
            plan = "premium";
            creditsToAdd = 100; // $39 one-time = 100 credits/month
        } else {
            throw new Error("Invalid payment amount");
        }

        const now = Date.now();
        const currentCredits = user.credits || 0;

        // Update user with lifetime plan and initial credits
        await ctx.db.patch(user._id, {
            lifetimePlan: plan,
            lifetimePlanPurchasedAt: now,
            creditsLastRefreshedAt: now,
            credits: currentCredits + creditsToAdd,
            updatedAt: now,
        });

        return {
            success: true,
            plan,
            creditsAdded: creditsToAdd,
            newTotal: currentCredits + creditsToAdd,
            message: `Lifetime ${plan} plan activated! You'll receive ${creditsToAdd} credits every month.`,
        };
    },
});

// Get user's lifetime plan info
export const getLifetimePlanInfo = query({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            return null;
        }

        if (!user.lifetimePlan) {
            return {
                hasLifetimePlan: false,
            };
        }

        const now = Date.now();
        const lastRefresh =
            user.creditsLastRefreshedAt ||
            user.lifetimePlanPurchasedAt ||
            user.createdAt;
        const daysSinceRefresh = (now - lastRefresh) / (1000 * 60 * 60 * 24);
        const daysUntilNextRefresh = Math.max(
            0,
            Math.ceil(30 - daysSinceRefresh),
        );

        return {
            hasLifetimePlan: true,
            plan: user.lifetimePlan,
            monthlyCredits: user.lifetimePlan === "basic" ? 20 : 100,
            purchaseDate: user.lifetimePlanPurchasedAt,
            lastRefreshDate: user.creditsLastRefreshedAt,
            daysUntilNextRefresh,
            canRefreshNow: daysSinceRefresh >= 30,
        };
    },
});
