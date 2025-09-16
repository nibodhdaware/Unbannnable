import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        // Check if Convex is configured
        if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
            return NextResponse.json(
                { error: "Database not configured" },
                { status: 503 },
            );
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id, emailAddresses, fullName } = user;
        const email = emailAddresses?.[0]?.emailAddress;

        if (!id) {
            return NextResponse.json(
                { error: "User ID not found" },
                { status: 400 },
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 },
            );
        }

        const userId = await convex.mutation(api.users.createOrUpdateUser, {
            clerkId: id,
            email: email,
            fullName: fullName || undefined,
            isAdmin: email === "nibod1248@gmail.com",
        });

        return NextResponse.json({
            success: true,
            message: "User synced successfully",
            userId,
        });
    } catch (error) {
        console.error("Error syncing user:", error);
        return NextResponse.json(
            { error: "Failed to sync user" },
            { status: 500 },
        );
    }
}
