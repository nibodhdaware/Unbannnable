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

        // Determine plan type from amount (handle both USD and INR)
        let planType = "tenPosts"; // default

        console.log("Manual allocation details:", {
            amount,
            originalAmount: amount,
        });

        // Handle different currencies and amounts
        // For USD amounts (handle both cents and dollars, and both string and number)
        const numAmount = Number(amount);
        const strAmount = String(amount);
        if (
            numAmount === 100 ||
            numAmount === 1 ||
            strAmount === "100" ||
            strAmount === "1"
        )
            planType = "tenPosts"; // $1.00 for 10 posts (100 cents or 1 dollar)
        else if (
            numAmount === 500 ||
            numAmount === 5 ||
            strAmount === "500" ||
            strAmount === "5"
        )
            planType = "hundredPosts"; // $5.00 for 100 posts (500 cents or 5 dollars)
        else if (
            numAmount === 1500 ||
            numAmount === 15 ||
            strAmount === "1500" ||
            strAmount === "15"
        )
            planType = "fiveHundredPosts"; // $15.00 for 500 posts (1500 cents or 15 dollars)

        console.log("Manual plan type determined:", {
            amount,
            planType,
            expectedPosts:
                planType === "tenPosts"
                    ? 10
                    : planType === "hundredPosts"
                      ? 100
                      : planType === "fiveHundredPosts"
                        ? 500
                        : 1,
        });

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
