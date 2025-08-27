import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Free tier limits
const FREE_POSTS_PER_MONTH = 1;

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Check if user is admin by email first
        const isAdminByEmail =
            user.emailAddresses[0]?.emailAddress === "nibod1248@gmail.com";

        // Ensure user exists in Convex database
        await convex.mutation(api.users.createOrUpdateUser, {
            clerkId: user.id,
            fullName: user.fullName || undefined,
            email: user.emailAddresses[0]?.emailAddress || "",
            isAdmin: isAdminByEmail,
            role: isAdminByEmail ? "admin" : "user",
        });

        // Get user from Convex
        const userRecord = await convex.query(api.users.getUserByClerkId, {
            clerkId: user.id,
        });

        if (!userRecord) {
            // User not in database yet, give them free posts
            return NextResponse.json({
                hasSubscription: false,
                postsRemaining: FREE_POSTS_PER_MONTH,
                unlimited: false,
                isAdmin: false,
            });
        }

        if (isAdminByEmail) {
            // For admin users, still show post stats but with unlimited access
            const postsThisMonth = await convex.query(
                api.posts.getPostsCountThisMonth,
                {
                    userId: userRecord._id,
                },
            );

            return NextResponse.json({
                hasSubscription: true,
                postsRemaining: -1, // Unlimited for admin
                unlimited: true,
                isAdmin: true,
                postsUsed: postsThisMonth, // Show admin their post usage for testing
                totalPurchasedPosts: userRecord.totalPurchasedPosts || 0,
            });
        }

        // Check for unlimited monthly access (valid until expiry)
        if (
            userRecord.unlimitedMonthlyExpiry &&
            userRecord.unlimitedMonthlyExpiry > Date.now()
        ) {
            return NextResponse.json({
                hasSubscription: true, // Keep this for backward compatibility
                postsRemaining: -1, // Unlimited
                unlimited: true,
                isAdmin: false,
            });
        }

        // For non-admin users without unlimited access, check post limits
        const postsThisMonth = await convex.query(
            api.posts.getPostsCountThisMonth,
            {
                userId: userRecord._id,
            },
        );

        // Calculate purchased posts used this month
        const postsThisMonthDetails = await convex.query(
            api.posts.getUserPosts,
            {
                userId: userRecord._id,
            },
        );

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const startOfMonthTimestamp = startOfMonth.getTime();

        const purchasedPostsUsed = postsThisMonthDetails.filter(
            (p) =>
                p.postType === "purchased" &&
                p.createdAt >= startOfMonthTimestamp,
        ).length;

        const totalPurchasedPosts = userRecord.totalPurchasedPosts || 0;
        const purchasedPostsRemaining = Math.max(
            0,
            totalPurchasedPosts - purchasedPostsUsed,
        );
        const freePostsRemaining = Math.max(
            0,
            FREE_POSTS_PER_MONTH - postsThisMonth + purchasedPostsUsed,
        );
        const totalPostsRemaining =
            freePostsRemaining + purchasedPostsRemaining;

        return NextResponse.json({
            hasSubscription: totalPurchasedPosts > 0,
            postsRemaining: totalPostsRemaining,
            unlimited: false,
            isAdmin: false,
            postsUsed: postsThisMonth,
            freePostsRemaining,
            purchasedPostsRemaining,
            totalPurchasedPosts,
        });
    } catch (error) {
        console.error("Error checking post limits:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
