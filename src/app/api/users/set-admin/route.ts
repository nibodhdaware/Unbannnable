import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 },
            );
        }

        // Only allow setting admin for the specific email
        if (email !== "nibod1248@gmail.com") {
            return NextResponse.json(
                { error: "Unauthorized to set admin for this email" },
                { status: 403 },
            );
        }

        // Find user by email
        const user = await convex.query(api.users.getUserByEmail, { email });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        // Update user to admin
        await convex.mutation(api.users.createOrUpdateUser, {
            clerkId: user.clerkId,
            fullName: user.fullName,
            email: user.email,
            role: "admin",
            isAdmin: true,
        });

        return NextResponse.json({
            success: true,
            message: `User ${email} has been set as admin`,
        });
    } catch (error) {
        console.error("Error setting admin:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
