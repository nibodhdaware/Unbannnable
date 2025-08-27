import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { clerkId, email, fullName } = user;

        const userId = await convex.mutation(api.users.createOrUpdateUser, {
            clerkId: clerkId!,
            email: email!,
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
