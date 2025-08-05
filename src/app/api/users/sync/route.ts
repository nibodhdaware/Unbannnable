import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const { clerkId, email, fullName } = await req.json();

        if (!clerkId || !email) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        console.log("Syncing user to Convex:", { clerkId, email, fullName });

        // Create or update user in Convex
        const userId = await convex.mutation(api.users.createOrUpdateUser, {
            clerkId,
            email,
            fullName: fullName || undefined,
            isAdmin: email === "nibod1248@gmail.com",
        });

        console.log("User synced successfully in Convex:", { clerkId, userId });

        return NextResponse.json({
            success: true,
            userId,
            isAdmin: email === "nibod1248@gmail.com",
        });
    } catch (error) {
        console.error("Convex sync error details:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
