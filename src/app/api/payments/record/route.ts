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
                // Determine plan type from metadata (more reliable than amount)
                let planType = "onePost"; // default
                let postsToAllocate = 1; // default

                console.log("Record route allocation details:", {
                    amount,
                    currency,
                    metadata,
                    productCart,
                });

                // Check metadata for plan information
                if (metadata) {
                    console.log("Metadata found:", metadata);

                    // Check for quantity in metadata
                    if (metadata.quantity) {
                        const quantity = Number(metadata.quantity);
                        console.log("Quantity from metadata:", quantity);

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
                        console.log("Plan type from metadata:", planType);
                    }
                }

                // Fallback: Check product cart for plan information
                if (productCart && productCart.length > 0) {
                    console.log("Product cart found:", productCart);

                    // Check if product cart contains plan information
                    for (const product of productCart) {
                        if (product.product_id) {
                            console.log("Product ID:", product.product_id);

                            // Map product IDs to plan types
                            if (
                                product.product_id.includes("ten") ||
                                product.product_id.includes("10")
                            ) {
                                planType = "tenPosts";
                                postsToAllocate = 10;
                            } else if (
                                product.product_id.includes("hundred") ||
                                product.product_id.includes("100")
                            ) {
                                planType = "hundredPosts";
                                postsToAllocate = 100;
                            } else if (
                                product.product_id.includes("five") ||
                                product.product_id.includes("500")
                            ) {
                                planType = "fiveHundredPosts";
                                postsToAllocate = 500;
                            }
                        }
                    }
                }

                console.log("Record route plan type determined:", {
                    amount,
                    currency,
                    planType,
                    postsToAllocate,
                    metadata,
                    productCart,
                });

                console.log("Allocating posts from record route:", {
                    paymentId,
                    userId: user._id,
                    planType,
                    postsToAllocate,
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
                    postsToAllocate,
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
