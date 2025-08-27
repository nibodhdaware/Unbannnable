import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const {
            clerkId,
            email,
            paymentId,
            amount,
            currency,
            status,
            paymentProvider,
            customerData,
            productCart,
            metadata,
            createdAt,
        } = await req.json();

        if (!clerkId || !email || !paymentId) {
            return NextResponse.json(
                { error: "Missing required payment information" },
                { status: 400 },
            );
        }

        // Check if Convex is configured
        if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
            console.log(
                "Development mode: No Convex configured, simulating payment record",
            );

            return NextResponse.json({
                success: true,
                message: "Payment simulated successfully (no database)",
                paymentId,
                development: true,
            });
        }

        // Get or create user
        await convex.mutation(api.users.createOrUpdateUser, {
            clerkId,
            email,
            fullName: customerData?.name || undefined,
            isAdmin: email === "nibod1248@gmail.com",
        });

        const user = await convex.query(api.users.getUserByClerkId, {
            clerkId,
        });

        if (!user) {
            return NextResponse.json(
                { error: "Failed to create/find user" },
                { status: 500 },
            );
        }

        // Check if payment already exists to avoid duplicates
        const existingPayment = await convex.query(
            api.payments.getPaymentByPaymentId,
            { paymentId },
        );

        if (existingPayment) {
            console.log("Payment already exists:", paymentId);
            return NextResponse.json({
                success: true,
                message: "Payment already recorded",
            });
        }

        // Record the payment
        const paymentData = {
            paymentId,
            userId: user._id,
            amount: amount || 0,
            currency: currency || "USD",
            status: status || "succeeded",
            paymentMethod: paymentProvider || "dodo",
        };

        const newPaymentId = await convex.mutation(
            api.payments.createPayment,
            paymentData,
        );

        console.log("Payment recorded successfully:", paymentId);

        // Also allocate posts if payment was successful
        if (status === "succeeded" || status === "completed") {
            try {
                // Determine plan type from amount (handle both USD and INR)
                let planType = "onePost"; // default

                console.log("Record route allocation details:", {
                    amount,
                    originalAmount: amount,
                });

                // Handle different currencies and amounts
                // For USD amounts in cents
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
                // Handle INR amounts (approximate conversion)
                else if (amount >= 80 && amount <= 90)
                    planType = "hundredPosts"; // ~$5.00 USD equivalent in INR
                else if (amount >= 15 && amount <= 25)
                    planType = "tenPosts"; // ~$1.00 USD equivalent in INR
                else if (amount >= 1200 && amount <= 1300)
                    planType = "fiveHundredPosts"; // ~$15.00 USD equivalent in INR

                console.log("Record route plan type determined:", {
                    amount,
                    planType,
                    expectedPosts: planType === "tenPosts" ? 10 : 
                                   planType === "hundredPosts" ? 100 : 
                                   planType === "fiveHundredPosts" ? 500 : 1
                });
                else if (amount === 999) planType = "fivePosts"; // Mock payments

                console.log("Allocating posts from record route:", {
                    paymentId,
                    userId: user._id,
                    planType,
                    amount,
                });

                const allocation = await convex.mutation(
                    api.payments.allocatePostsFromPayment,
                    {
                        paymentId,
                        userId: user._id,
                        planType,
                    },
                );

                console.log("Posts allocated successfully from record route:", {
                    paymentId,
                    planType,
                    allocation,
                });

                return NextResponse.json({
                    success: true,
                    message:
                        "Payment recorded and posts allocated successfully",
                    paymentId,
                    convexPaymentId: newPaymentId,
                    allocation,
                });
            } catch (allocationError) {
                console.error(
                    "Error allocating posts from record route:",
                    allocationError,
                );
                return NextResponse.json({
                    success: true,
                    message: "Payment recorded but post allocation failed",
                    paymentId,
                    convexPaymentId: newPaymentId,
                    allocationError:
                        allocationError instanceof Error
                            ? allocationError.message
                            : "Unknown error",
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Payment recorded successfully",
            paymentId,
            convexPaymentId: newPaymentId,
        });
    } catch (error) {
        console.error("Payment recording error:", error);
        return NextResponse.json(
            {
                error: "Failed to record payment",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
