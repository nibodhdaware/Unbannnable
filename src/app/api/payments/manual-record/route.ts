import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

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

        const { amount, paymentId } = await req.json();

        if (!amount) {
            return NextResponse.json(
                { error: "Amount is required" },
                { status: 400 },
            );
        }

        console.log("Manual payment record request:", {
            amount,
            paymentId,
            userEmail: user.emailAddresses[0]?.emailAddress,
        });

        // Get or create user
        await convex.mutation(api.users.createOrUpdateUser, {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            fullName: user.fullName || undefined,
            isAdmin:
                user.emailAddresses[0]?.emailAddress === "nibod1248@gmail.com",
        });

        const userRecord = await convex.query(api.users.getUserByClerkId, {
            clerkId: user.id,
        });

        if (!userRecord) {
            return NextResponse.json(
                { error: "Failed to create/find user" },
                { status: 500 },
            );
        }

        // Determine plan type from amount
        let planType = "onePost"; // default

        if (amount === 100)
            planType = "tenPosts"; // $1.00 for 10 posts
        else if (amount === 500)
            planType = "hundredPosts"; // $5.00 for 100 posts
        else if (amount === 1500)
            planType = "fiveHundredPosts"; // $15.00 for 500 posts
        else if (amount === 1)
            planType = "onePost"; // $1.00 for 1 post (legacy)
        else if (amount === 699)
            planType = "fivePosts"; // $6.99 (legacy)
        else if (amount === 1499)
            planType = "unlimited_monthly_1499"; // $14.99 (legacy)
        else if (amount === 999) planType = "fivePosts"; // Mock payments

        console.log("Allocating posts manually:", {
            paymentId: paymentId || `manual_${Date.now()}`,
            userId: userRecord._id,
            planType,
            amount,
        });

        const allocation = await convex.mutation(
            api.payments.allocatePostsFromPayment,
            {
                paymentId: paymentId || `manual_${Date.now()}`,
                userId: userRecord._id,
                planType,
            },
        );

        console.log("Manual allocation successful:", allocation);

        return NextResponse.json({
            success: true,
            message: "Posts allocated successfully",
            allocation,
        });
    } catch (error) {
        console.error("Manual payment record error:", error);
        return NextResponse.json(
            {
                error: "Failed to allocate posts",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

// Handle other HTTP methods
export async function GET() {
    return NextResponse.json({
        message: "Use POST to record a payment",
        requiredFields: ["paymentId", "customerEmail", "amount"],
        optionalFields: ["customerName", "status"],
    });
}
