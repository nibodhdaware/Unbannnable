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

        // Determine plan type from metadata (more reliable than amount)
        let planType = "onePost"; // default
        let postsToAllocate = 1; // default

        // Check if metadata is provided in the request body
        let metadata = null;
        try {
            const requestBody = await req.json();
            metadata = requestBody.metadata;
        } catch (error) {
            // Could not parse request body for metadata
        }

        // Check metadata for plan information
        if (metadata && typeof metadata === "object") {
            // Check for quantity in metadata
            if ((metadata as any).quantity) {
                const quantity = Number((metadata as any).quantity);

                if (quantity === 10) {
                    planType = "tenPosts";
                    postsToAllocate = 10;
                } else if (quantity === 100) {
                    planType = "hundredPosts";
                    postsToAllocate = 100;
                } else if (quantity === 500) {
                    planType = "fiveHundredPosts";
                    postsToAllocate = 500;
                }
            }

            // Also check for plan type in metadata
            if ((metadata as any).planType) {
                planType = (metadata as any).planType;
            }
        }

        // Fallback: Use amount-based logic if no metadata
        if (planType === "onePost") {
            const numAmount = Number(amount);
            if (numAmount === 100 || numAmount === 1) {
                planType = "tenPosts";
                postsToAllocate = 10;
            } else if (numAmount === 500 || numAmount === 5) {
                planType = "hundredPosts";
                postsToAllocate = 100;
            } else if (numAmount === 1500 || numAmount === 15) {
                planType = "fiveHundredPosts";
                postsToAllocate = 500;
            }
        }

        const allocation = await convex.mutation(
            api.payments.allocatePostsFromPayment,
            {
                paymentId: paymentId || `manual_${Date.now()}`,
                userId: userRecord._id,
                planType,
            },
        );

        return NextResponse.json({
            success: true,
            message: "Posts allocated successfully",
            allocation,
        });
    } catch (error) {
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
