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
