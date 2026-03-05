import { NextRequest, NextResponse } from "next/server";
import { currentUser, verifyToken, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function buildEmptyResponse() {
    return {
        isLoggedIn: true,
        credits: 0,
        usage: {
            monthlyCreditsUsed: 0,
            totalCreditsUsed: 0,
            analysesThisMonth: 0,
            totalAnalyzedPosts: 0,
        },
    };
}

async function resolveClerkId(request: NextRequest): Promise<string | null> {
    const user = await currentUser();
    if (user?.id) return user.id;

    const sessionToken = request.headers.get("x-clerk-session-token");
    if (!sessionToken || !process.env.CLERK_SECRET_KEY) return null;

    try {
        const payload = await verifyToken(sessionToken, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        const sub = payload?.sub;
        return typeof sub === "string" ? sub : null;
    } catch {
        return null;
    }
}

async function ensureUserRecord(clerkId: string) {
    let userRecord = await convex.query(api.users.getUserByClerkId, { clerkId });

    if (userRecord) {
        return userRecord;
    }

    try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
        const fullName = [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(" ") || undefined;
        const isAdminByEmail = email === "nibod1248@gmail.com";

        await convex.mutation(api.users.createOrUpdateUser, {
            clerkId,
            fullName,
            email,
            isAdmin: isAdminByEmail,
        });

        userRecord = await convex.query(api.users.getUserByClerkId, { clerkId });
        return userRecord;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const clerkId = await resolveClerkId(request);

        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRecord = await ensureUserRecord(clerkId);

        if (!userRecord) {
            return NextResponse.json(buildEmptyResponse(), { status: 200 });
        }

        const posts = await convex.query(api.posts.getUserPosts, {
            userId: userRecord._id,
        });

        const now = new Date();
        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
            0,
            0,
            0,
            0,
        ).getTime();

        const usage = posts.reduce(
            (acc, post) => {
                const creditsSpent = post.totalCreditsSpent || 0;
                const analysesUsed = post.aiFeaturesUsed?.length || 0;

                acc.totalCreditsUsed += creditsSpent;

                if (post.createdAt >= startOfMonth) {
                    acc.monthlyCreditsUsed += creditsSpent;
                    acc.analysesThisMonth += analysesUsed;
                }

                if (analysesUsed > 0) {
                    acc.totalAnalyzedPosts += 1;
                }

                return acc;
            },
            {
                monthlyCreditsUsed: 0,
                totalCreditsUsed: 0,
                analysesThisMonth: 0,
                totalAnalyzedPosts: 0,
            },
        );

        return NextResponse.json({
            isLoggedIn: true,
            credits: userRecord.credits || 0,
            usage,
        });
    } catch (error) {
        console.error("Error fetching user credits summary:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
