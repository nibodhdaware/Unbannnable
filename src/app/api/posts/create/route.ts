import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

        // Ensure user exists in Convex database
        await convex.mutation(api.users.createOrUpdateUser, {
            clerkId: user.id,
            fullName: user.fullName || undefined,
            email: user.emailAddresses[0]?.emailAddress || "",
            isAdmin:
                user.emailAddresses[0]?.emailAddress === "nibod1248@gmail.com",
            role:
                user.emailAddresses[0]?.emailAddress === "nibod1248@gmail.com"
                    ? "admin"
                    : "user",
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

        // Check if user is admin
        const isAdminUser =
            userRecord.isAdmin === true ||
            userRecord.email === "nibod1248@gmail.com";

        // Determine post type and check limits
        let postType: "free" | "purchased" | "unlimited";

        if (isAdminUser) {
            // Admin users get unlimited posts
            postType = "unlimited";
        } else {
            // Check if user can create a post
            const canCreate = await convex.query(api.posts.canUserCreatePost, {
                userId: userRecord._id,
            });

            if (!canCreate.canCreate) {
                const postStats = await convex.query(
                    api.posts.getUserPostStats,
                    {
                        userId: userRecord._id,
                    },
                );

                return NextResponse.json(
                    {
                        error: "No posts remaining",
                        message: "You need to purchase more posts to continue.",
                        postStats,
                    },
                    { status: 403 },
                );
            }

            // Determine post type for non-admin users
            if (canCreate.reason === "unlimited") {
                postType = "unlimited";
            } else if (canCreate.reason === "free") {
                postType = "free";
            } else {
                postType = "purchased";
            }
        }

        // Create the post
        const postId = await convex.mutation(api.posts.createPost, {
            userId: userRecord._id,
            title,
            body: content,
            subreddit,
            postType,
        });

        // Get updated stats
        const updatedStats = await convex.query(api.posts.getUserPostStats, {
            userId: userRecord._id,
        });

        console.log(
            `Post created by user: ${title} in ${subreddit} (${postType} post)`,
        );

        return NextResponse.json({
            success: true,
            postId,
            postType,
            updatedStats,
            message: `Post created successfully using ${postType} allocation.`,
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
