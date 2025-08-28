import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

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
        } = body;

        // Validate required fields
        if (!clerkId) {
            return NextResponse.json(
                { error: "Missing clerkId" },
                { status: 400 },
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: "Missing email" },
                { status: 400 },
            );
        }

        if (!paymentId) {
            return NextResponse.json(
                { error: "Missing paymentId" },
                { status: 400 },
            );
        }

        // Check if Convex is configured
        if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
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

        // Also allocate posts if payment was successful
        if (status === "succeeded" || status === "completed") {
            try {
                // Determine plan type from metadata (more reliable than amount)
                let planType = "onePost"; // default
                let postsToAllocate = 1; // default

                // Check metadata for plan information
                if (metadata) {
                    // Check for quantity in metadata
                    if (metadata.quantity) {
                        const quantity = Number(metadata.quantity);

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
                    if (metadata.planType) {
                        planType = metadata.planType;
                    }
                }

                // Check product cart for plan information
                if (productCart && productCart.length > 0) {
                    for (const product of productCart) {
                        if (product.product_id) {
                            // Map product IDs to plan types based on your DodoPay configuration
                            if (
                                product.product_id ===
                                "pdt_YuBZGtdCE3Crz89JDgLkf"
                            ) {
                                // $1 for 10 posts
                                planType = "tenPosts";
                                postsToAllocate = 10;
                            } else if (
                                product.product_id ===
                                "pdt_c5oTeIMDSCUcUc2vLCcTe"
                            ) {
                                // $5 for 100 posts
                                planType = "hundredPosts";
                                postsToAllocate = 100;
                            } else if (
                                product.product_id ===
                                "pdt_7zSMnSK9jUYRZ5mfqkfAq"
                            ) {
                                // $15 for 500 posts
                                planType = "fiveHundredPosts";
                                postsToAllocate = 500;
                            }
                        }
                    }
                }

                const allocation = await convex.mutation(
                    api.payments.allocatePostsFromPayment,
                    {
                        paymentId,
                        userId: user._id,
                        planType,
                    },
                );

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
