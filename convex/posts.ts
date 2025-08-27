import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new post
export const createPost = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
        status: v.optional(v.string()),
        postType: v.optional(
            v.union(
                v.literal("free"),
                v.literal("purchased"),
                v.literal("unlimited"),
            ),
        ),
        paymentId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Validate user exists
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Determine post type if not provided
        let postType = args.postType;
        if (!postType) {
            // Auto-determine based on user's current status
            const userStats = await getUserPostStatsInternal(ctx, args.userId);

            if (userStats.hasUnlimitedAccess) {
                postType = "unlimited";
            } else if (userStats.freePostsRemaining > 0) {
                postType = "free";
            } else if (userStats.purchasedPostsRemaining > 0) {
                postType = "purchased";
            } else {
                throw new Error("User has no remaining posts");
            }
        }

        // Create the post
        const postId = await ctx.db.insert("posts", {
            ...args,
            postType,
            createdAt: now,
        });

        // Update user's post usage based on type
        if (postType === "free") {
            const currentFreeUsed = user.freePostsUsed || 0;
            await ctx.db.patch(args.userId, {
                freePostsUsed: currentFreeUsed + 1,
                updatedAt: now,
            });
            console.log(
                `User ${args.userId} used free post. Total free posts used: ${currentFreeUsed + 1}`,
            );
        } else if (postType === "purchased") {
            // For purchased posts, we track usage but don't decrement totalPurchasedPosts
            // The decrementing is handled by the monthly usage tracking
            console.log(`User ${args.userId} used purchased post.`);
        } else if (postType === "unlimited") {
            // For unlimited posts (admin), we still track usage for analytics
            console.log(`User ${args.userId} used unlimited post (admin).`);
        }

        console.log(`Created ${postType} post for user ${args.userId}:`, {
            postId,
            title: args.title,
            subreddit: args.subreddit,
            paymentId: args.paymentId,
        });

        return postId;
    },
});

// Internal function to get user post stats (for use within mutations)
async function getUserPostStatsInternal(ctx: any, userId: any) {
    const user = await ctx.db.get(userId);
    if (!user) {
        return {
            freePostsUsed: 0,
            freePostsRemaining: 1,
            purchasedPostsRemaining: 0,
            totalPostsUsed: 0,
            hasUnlimitedAccess: false,
            unlimitedExpiry: null,
            isAdmin: false,
        };
    }

    // Check if user is admin
    const isAdminUser =
        user.isAdmin === true || user.email === "nibod1248@gmail.com";

    if (isAdminUser) {
        return {
            freePostsUsed: 0,
            freePostsRemaining: 0,
            purchasedPostsRemaining: 0,
            totalPostsUsed: 0,
            hasUnlimitedAccess: true,
            unlimitedExpiry: null,
            isAdmin: true,
        };
    }

    const freePostsUsed = user.freePostsUsed || 0;
    const totalPurchasedPosts = user.totalPurchasedPosts || 0;

    // Check if user has unlimited monthly access
    const now = Date.now();
    const hasUnlimitedAccess =
        user.unlimitedMonthlyExpiry && user.unlimitedMonthlyExpiry > now;

    // Get total posts used this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const postsThisMonth = await ctx.db
        .query("posts")
        .withIndex("by_user_and_date", (q: any) =>
            q.eq("userId", userId).gte("createdAt", startOfMonth.getTime()),
        )
        .collect();

    // Calculate purchased posts used this month
    const purchasedPostsUsed = postsThisMonth.filter(
        (p: any) => p.postType === "purchased",
    ).length;
    const purchasedPostsRemaining = Math.max(
        0,
        totalPurchasedPosts - purchasedPostsUsed,
    );

    return {
        freePostsUsed,
        freePostsRemaining: Math.max(0, 1 - freePostsUsed), // 1 free post total
        purchasedPostsRemaining,
        totalPostsUsed: postsThisMonth.length,
        hasUnlimitedAccess,
        unlimitedExpiry: user.unlimitedMonthlyExpiry || null,
        isAdmin: false,
    };
}

// Get posts count for a user in the current month
export const getPostsCountThisMonth = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthTimestamp = startOfMonth.getTime();

        const posts = await ctx.db
            .query("posts")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", userId).gte("createdAt", startOfMonthTimestamp),
            )
            .collect();

        return posts.length;
    },
});

// Get all posts for a user
export const getUserPosts = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("posts")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Get user post statistics
export const getUserPostStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            return {
                freePostsUsed: 0,
                freePostsRemaining: 1,
                purchasedPostsRemaining: 0,
                totalPostsUsed: 0,
                hasUnlimitedAccess: false,
                unlimitedExpiry: null,
            };
        }

        // Check if user is admin
        const isAdminUser =
            user.isAdmin === true || user.email === "nibod1248@gmail.com";

        if (isAdminUser) {
            // Get total posts used this month for admin users too
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const postsThisMonth = await ctx.db
                .query("posts")
                .withIndex("by_user_and_date", (q) =>
                    q
                        .eq("userId", userId)
                        .gte("createdAt", startOfMonth.getTime()),
                )
                .collect();

            return {
                freePostsUsed: 0,
                freePostsRemaining: 0,
                purchasedPostsRemaining: 0,
                totalPostsUsed: postsThisMonth.length,
                hasUnlimitedAccess: true,
                unlimitedExpiry: null,
                isAdmin: true,
                postsThisMonth: postsThisMonth.length, // Additional field for admin
            };
        }

        const freePostsUsed = user.freePostsUsed || 0;
        const totalPurchasedPosts = user.totalPurchasedPosts || 0;

        // Check if user has unlimited monthly access
        const now = Date.now();
        const hasUnlimitedAccess =
            user.unlimitedMonthlyExpiry && user.unlimitedMonthlyExpiry > now;

        // Get total posts used this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const postsThisMonth = await ctx.db
            .query("posts")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", userId).gte("createdAt", startOfMonth.getTime()),
            )
            .collect();

        // Calculate purchased posts used this month
        const purchasedPostsUsed = postsThisMonth.filter(
            (p) => p.postType === "purchased",
        ).length;
        const purchasedPostsRemaining = Math.max(
            0,
            totalPurchasedPosts - purchasedPostsUsed,
        );

        return {
            freePostsUsed,
            freePostsRemaining: Math.max(0, 1 - freePostsUsed), // 1 free post total
            purchasedPostsRemaining,
            totalPostsUsed: postsThisMonth.length,
            hasUnlimitedAccess,
            unlimitedExpiry: user.unlimitedMonthlyExpiry || null,
            isAdmin: false,
        };
    },
});

// Check if user can create a post
export const canUserCreatePost = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        // Get user post stats directly
        const user = await ctx.db.get(userId);
        if (!user) {
            return {
                canCreate: false,
                reason: "user_not_found",
                postsRemaining: 0,
            };
        }

        // Check if user is admin
        const isAdminUser =
            user.isAdmin === true || user.email === "nibod1248@gmail.com";

        if (isAdminUser) {
            // Get total posts used this month for admin users
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const postsThisMonth = await ctx.db
                .query("posts")
                .withIndex("by_user_and_date", (q) =>
                    q
                        .eq("userId", userId)
                        .gte("createdAt", startOfMonth.getTime()),
                )
                .collect();

            return {
                canCreate: true,
                reason: "admin_unlimited",
                postsRemaining: "unlimited",
                postsUsed: postsThisMonth.length, // Show admin their usage
            };
        }

        const freePostsUsed = user.freePostsUsed || 0;
        const totalPurchasedPosts = user.totalPurchasedPosts || 0;

        // Check if user has unlimited monthly access
        const now = Date.now();
        const hasUnlimitedAccess =
            user.unlimitedMonthlyExpiry && user.unlimitedMonthlyExpiry > now;

        // Check if user has unlimited access
        if (hasUnlimitedAccess) {
            return {
                canCreate: true,
                reason: "unlimited",
                postsRemaining: "unlimited",
            };
        }

        // Check free posts
        const freePostsRemaining = Math.max(0, 1 - freePostsUsed);
        if (freePostsRemaining > 0) {
            return {
                canCreate: true,
                reason: "free",
                postsRemaining: freePostsRemaining,
            };
        }

        // Get purchased posts used this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const postsThisMonth = await ctx.db
            .query("posts")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", userId).gte("createdAt", startOfMonth.getTime()),
            )
            .collect();

        const purchasedPostsUsed = postsThisMonth.filter(
            (p) => p.postType === "purchased",
        ).length;
        const purchasedPostsRemaining = Math.max(
            0,
            totalPurchasedPosts - purchasedPostsUsed,
        );

        // Check purchased posts
        if (purchasedPostsRemaining > 0) {
            return {
                canCreate: true,
                reason: "purchased",
                postsRemaining: purchasedPostsRemaining,
            };
        }

        return {
            canCreate: false,
            reason: "no_posts_remaining",
            postsRemaining: 0,
        };
    },
});
