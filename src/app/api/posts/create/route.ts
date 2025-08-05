import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Free tier limits
const FREE_POSTS_PER_MONTH = 5;

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { title, content, subreddit } = await request.json();

        if (!title || !content || !subreddit) {
            return NextResponse.json(
                { error: "Title, content, and subreddit are required" },
                { status: 400 },
            );
        }

        // Check if user is admin (server-side verification)
        const adminStatus = await convex.query(api.users.isAdmin, {
            clerkId: user.id,
        });

        // Ensure user exists in Convex database
        await convex.mutation(api.users.createOrUpdateUser, {
            clerkId: user.id,
            fullName: user.fullName || undefined,
            email: user.emailAddresses[0]?.emailAddress || "",
            isAdmin:
                user.emailAddresses[0]?.emailAddress === "nibod1248@gmail.com",
        });

        // Get user from Convex
        const userRecord = await convex.query(api.users.getUserByClerkId, {
            clerkId: user.id,
        });

        if (!userRecord) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        // For non-admin users, check post limits
        if (!adminStatus) {
            // Check for active subscription (payments this month)
            const activePayments = await convex.query(
                api.payments.getActivePaymentsThisMonth,
                {
                    userId: userRecord._id,
                },
            );

            // If no active subscription, check free tier limits
            if (activePayments.length === 0) {
                const postsThisMonth = await convex.query(
                    api.posts.getPostsCountThisMonth,
                    {
                        userId: userRecord._id,
                    },
                );

                if (postsThisMonth >= FREE_POSTS_PER_MONTH) {
                    return NextResponse.json(
                        {
                            error: "Post limit reached",
                            message: `You have reached your limit of ${FREE_POSTS_PER_MONTH} posts per month. Please upgrade to post more.`,
                            postsUsed: postsThisMonth,
                            limit: FREE_POSTS_PER_MONTH,
                        },
                        { status: 429 },
                    );
                }
            }
        }

        // Create the post in Convex
        const newPostId = await convex.mutation(api.posts.createPost, {
            userId: userRecord._id,
            title: title.trim(),
            body: content.trim(),
            subreddit: subreddit.trim(),
            status: "pending",
        });

        // In a real Reddit integration, you would:
        // 1. Use Reddit API to create the actual post
        // 2. Handle Reddit-specific validation (subreddit rules, etc.)
        // 3. Store Reddit post ID for tracking

        console.log(
            `Post created by ${
                adminStatus ? "admin" : "user"
            }: ${title} in ${subreddit}`,
        );

        return NextResponse.json({
            success: true,
            postId: newPostId,
            message: adminStatus
                ? "Post created with admin privileges"
                : "Post created successfully",
            isAdmin: adminStatus,
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
