import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

// Create or update user
export const createOrUpdateUser = mutation({
    args: {
        clerkId: v.string(),
        fullName: v.optional(v.string()),
        email: v.string(),
        role: v.optional(v.string()),
        isAdmin: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                updatedAt: now,
            });
            return existing._id;
        } else {
            return await ctx.db.insert("users", {
                ...args,
                createdAt: now,
                updatedAt: now,
            });
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

// Get user payment summary
export const getUserPaymentSummary = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            return null;
        }

        // Get all payments for this user
        const payments = await ctx.db
            .query("payments")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();

        // Get successful payments only
        const successfulPayments = payments.filter(
            (p) => p.status === "succeeded",
        );

        // Calculate totals
        const totalSpent = successfulPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0,
        );
        const totalPayments = successfulPayments.length;

        // Get most recent payment
        const lastPayment = successfulPayments.sort(
            (a, b) => b.createdAt - a.createdAt,
        )[0];

        return {
            userId,
            totalSpent,
            totalPayments,
            lastPayment: lastPayment
                ? {
                      paymentId: lastPayment.paymentId,
                      amount: lastPayment.amount,
                      date: lastPayment.createdAt,
                      planType: lastPayment.planType,
                  }
                : null,
            freePostsUsed: user.freePostsUsed || 0,
            totalPurchasedPosts: user.totalPurchasedPosts || 0,
            unlimitedMonthlyExpiry: user.unlimitedMonthlyExpiry,
            hasActiveUnlimited: user.unlimitedMonthlyExpiry
                ? user.unlimitedMonthlyExpiry > Date.now()
                : false,
        };
    },
});
