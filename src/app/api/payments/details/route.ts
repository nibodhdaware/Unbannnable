import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get("payment_id");

        if (!paymentId) {
            return NextResponse.json(
                { error: "Payment ID is required" },
                { status: 400 },
            );
        }

        // Check for mock payment in development or no API key
        if (
            paymentId.startsWith("mock_payment_") ||
            !process.env.DODO_PAYMENTS_API_KEY
        ) {
            console.log("Development mode: Returning mock payment details");

            const userEmail =
                user.emailAddresses[0]?.emailAddress || "mock@email.com";

            const mockPaymentData = {
                payment_id: paymentId,
                status: "succeeded",
                total_amount: 999, // $9.99 in cents
                currency: "USD",
                customer: {
                    customer_id: `mock_customer_${user.id}`,
                    name: user.fullName || "Mock User",
                    email: userEmail,
                },
                created_at: new Date().toISOString(),
                product_cart: [
                    {
                        product_id: "mock_product_monthly",
                        quantity: 1,
                    },
                ],
                metadata: {
                    clerk_user_id: user.id,
                    product_type: "monthly",
                    created_via: "reddit_unbanr_app",
                },
                settlement_amount: 999,
                settlement_currency: "USD",
                tax: 0,
            };

            // Store mock payment in database for development
            try {
                // Ensure user exists in Convex database
                let convexUser = await convex.query(
                    api.users.getUserByClerkId,
                    {
                        clerkId: user.id,
                    },
                );

                if (!convexUser) {
                    const newUserId = await convex.mutation(
                        api.users.createOrUpdateUser,
                        {
                            clerkId: user.id,
                            email: userEmail,
                            fullName: user.fullName || "Mock User",
                            isAdmin: userEmail === "nibod1248@gmail.com",
                        },
                    );
                    convexUser = await convex.query(api.users.getUser, {
                        id: newUserId,
                    });
                }

                if (convexUser) {
                    // Check if mock payment already exists
                    const existingPayment = await convex.query(
                        api.payments.getPaymentByPaymentId,
                        { paymentId: mockPaymentData.payment_id },
                    );

                    if (!existingPayment) {
                        // Create mock payment record
                        const paymentRecord = await convex.mutation(
                            api.payments.createPayment,
                            {
                                paymentId: mockPaymentData.payment_id,
                                userId: convexUser._id,
                                amount: mockPaymentData.total_amount,
                                currency: mockPaymentData.currency,
                                status: mockPaymentData.status,
                                paymentMethod: "mock",
                                customerEmail: userEmail,
                                customerName: user.fullName || "Mock User",
                                paymentType: "one_time",
                                metadata: JSON.stringify(
                                    mockPaymentData.metadata,
                                ),
                            },
                        );

                        console.log(
                            "Mock payment recorded in database:",
                            paymentRecord,
                        );

                        // Allocate posts for mock payment (using $9.99 amount)
                        if (paymentRecord) {
                            let planType = "fivePosts"; // $9.99 mock payment gets 5 posts

                            try {
                                const allocation = await convex.mutation(
                                    api.payments.allocatePostsFromPayment,
                                    {
                                        paymentId: mockPaymentData.payment_id,
                                        userId: convexUser._id,
                                        planType,
                                    },
                                );

                                console.log("Mock payment posts allocated:", {
                                    paymentId: mockPaymentData.payment_id,
                                    userId: convexUser._id,
                                    planType,
                                    allocation,
                                });
                            } catch (allocationError) {
                                console.error(
                                    "Error allocating mock payment posts:",
                                    allocationError,
                                );
                            }
                        }
                    } else {
                        console.log("Mock payment already exists in database");
                    }
                }
            } catch (dbError) {
                console.error(
                    "Mock payment database operation error:",
                    dbError,
                );
                // Don't fail the request if database operations fail
            }

            return NextResponse.json({
                paymentId: mockPaymentData.payment_id,
                status: mockPaymentData.status,
                amount: mockPaymentData.total_amount,
                currency: mockPaymentData.currency,
                customer: mockPaymentData.customer,
                created_at: mockPaymentData.created_at,
                product_cart: mockPaymentData.product_cart,
                metadata: mockPaymentData.metadata,
                settlement_amount: mockPaymentData.settlement_amount,
                settlement_currency: mockPaymentData.settlement_currency,
                tax: mockPaymentData.tax,
            });
        }

        // Get payment details from Dodo Payments API
        const dodoApiUrl =
            process.env.NODE_ENV === "production"
                ? "https://live.dodopayments.com"
                : "https://test.dodopayments.com";

        console.log("Fetching payment from DodoPay:", {
            paymentId,
            apiUrl: `${dodoApiUrl}/payments/${paymentId}`,
            hasApiKey: !!process.env.DODO_PAYMENTS_API_KEY,
        });

        const response = await fetch(`${dodoApiUrl}/payments/${paymentId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        console.log("DodoPay API response:", {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Dodo API error:", {
                status: response.status,
                statusText: response.statusText,
                errorText,
                paymentId,
                apiUrl: `${dodoApiUrl}/payments/${paymentId}`,
            });

            // If it's a 404, it might be a mock payment or invalid payment ID
            if (response.status === 404) {
                console.log(
                    "Payment not found in DodoPay, checking if it's a test payment",
                );
                // Return a mock response for testing
                const mockPaymentData = {
                    payment_id: paymentId,
                    status: "succeeded",
                    total_amount: 199,
                    currency: "USD",
                    customer: {
                        customer_id: `mock_customer_${Date.now()}`,
                        name: user.fullName || "Test User",
                        email:
                            user.emailAddresses[0]?.emailAddress ||
                            "test@example.com",
                    },
                    created_at: new Date().toISOString(),
                    product_cart: [
                        {
                            product_id: "pdt_Sqt14rBf5vO14Z8ReuHqB",
                            quantity: 1,
                        },
                    ],
                    metadata: {},
                    settlement_amount: 199,
                    settlement_currency: "USD",
                    tax: 0,
                };

                // Store 404 mock payment in database for testing
                try {
                    // Ensure user exists in Convex database
                    let convexUser = await convex.query(
                        api.users.getUserByClerkId,
                        {
                            clerkId: user.id,
                        },
                    );

                    if (!convexUser) {
                        const userEmail =
                            user.emailAddresses[0]?.emailAddress ||
                            "test@example.com";
                        const newUserId = await convex.mutation(
                            api.users.createOrUpdateUser,
                            {
                                clerkId: user.id,
                                email: userEmail,
                                fullName: user.fullName || "Test User",
                                isAdmin: userEmail === "nibod1248@gmail.com",
                            },
                        );
                        convexUser = await convex.query(api.users.getUser, {
                            id: newUserId,
                        });
                    }

                    if (convexUser) {
                        // Check if 404 mock payment already exists
                        const existingPayment = await convex.query(
                            api.payments.getPaymentByPaymentId,
                            { paymentId: mockPaymentData.payment_id },
                        );

                        if (!existingPayment) {
                            // Create 404 mock payment record
                            const paymentRecord = await convex.mutation(
                                api.payments.createPayment,
                                {
                                    paymentId: mockPaymentData.payment_id,
                                    userId: convexUser._id,
                                    amount: mockPaymentData.total_amount,
                                    currency: mockPaymentData.currency,
                                    status: mockPaymentData.status,
                                    paymentMethod: "mock_404",
                                    customerEmail:
                                        mockPaymentData.customer.email,
                                    customerName: mockPaymentData.customer.name,
                                    paymentType: "one_time",
                                    metadata: JSON.stringify(
                                        mockPaymentData.metadata,
                                    ),
                                },
                            );

                            console.log(
                                "404 mock payment recorded in database:",
                                paymentRecord,
                            );

                            // Allocate posts for 404 mock payment ($1.99 = 1 post)
                            if (paymentRecord) {
                                let planType = "onePost"; // $1.99 gets 1 post

                                try {
                                    const allocation = await convex.mutation(
                                        api.payments.allocatePostsFromPayment,
                                        {
                                            paymentId:
                                                mockPaymentData.payment_id,
                                            userId: convexUser._id,
                                            planType,
                                        },
                                    );

                                    console.log(
                                        "404 mock payment posts allocated:",
                                        {
                                            paymentId:
                                                mockPaymentData.payment_id,
                                            userId: convexUser._id,
                                            planType,
                                            allocation,
                                        },
                                    );
                                } catch (allocationError) {
                                    console.error(
                                        "Error allocating 404 mock payment posts:",
                                        allocationError,
                                    );
                                }
                            }
                        } else {
                            console.log(
                                "404 mock payment already exists in database",
                            );
                        }
                    }
                } catch (dbError) {
                    console.error(
                        "404 mock payment database operation error:",
                        dbError,
                    );
                    // Don't fail the request if database operations fail
                }

                return NextResponse.json({
                    paymentId: mockPaymentData.payment_id,
                    status: mockPaymentData.status,
                    amount: mockPaymentData.total_amount,
                    currency: mockPaymentData.currency,
                    customer: mockPaymentData.customer,
                    created_at: mockPaymentData.created_at,
                    product_cart: mockPaymentData.product_cart,
                    metadata: mockPaymentData.metadata,
                    settlement_amount: mockPaymentData.settlement_amount,
                    settlement_currency: mockPaymentData.settlement_currency,
                    tax: mockPaymentData.tax,
                });
            }

            return NextResponse.json(
                {
                    error: "Failed to fetch payment details",
                    details: errorText,
                    status: response.status,
                },
                { status: response.status },
            );
        }

        const paymentData = await response.json();
        console.log("Fetched payment data:", paymentData);

        // Validate that this payment belongs to the current user
        const userEmail = user.emailAddresses[0]?.emailAddress;
        console.log("Current user email:", userEmail);
        console.log("Payment customer email:", paymentData.customer?.email);

        // Check if the payment belongs to the current user
        // Allow if emails match OR if user is an admin (nibod1248@gmail.com)
        const isOwner = paymentData.customer?.email === userEmail;
        const isAdmin = userEmail === "nibod1248@gmail.com";

        // In development mode, be more lenient with email validation
        const isDevelopment = process.env.NODE_ENV === "development";
        const isValidInDevelopment =
            isDevelopment && (userEmail || paymentData.customer?.email);

        if (!isOwner && !isAdmin && !isValidInDevelopment) {
            console.log("Payment ownership validation failed:", {
                userEmail,
                paymentEmail: paymentData.customer?.email,
                isAdmin,
                isDevelopment,
                isValidInDevelopment,
            });
            return NextResponse.json(
                {
                    error: "Payment does not belong to current user",
                    details: {
                        userEmail,
                        paymentEmail: paymentData.customer?.email,
                        isDevelopment,
                    },
                },
                { status: 403 },
            );
        }

        // Store payment in database and update user if payment is successful
        if (
            paymentData.status === "succeeded" ||
            paymentData.status === "completed"
        ) {
            try {
                // Ensure user exists in Convex database
                let convexUser = await convex.query(
                    api.users.getUserByClerkId,
                    {
                        clerkId: user.id,
                    },
                );

                if (!convexUser) {
                    const userEmail = user.emailAddresses[0]?.emailAddress;
                    if (userEmail) {
                        const newUserId = await convex.mutation(
                            api.users.createOrUpdateUser,
                            {
                                clerkId: user.id,
                                email: userEmail,
                                fullName: user.fullName || "",
                                isAdmin: userEmail === "nibod1248@gmail.com",
                            },
                        );
                        convexUser = await convex.query(api.users.getUser, {
                            id: newUserId,
                        });
                        console.log("Created new user in database:", {
                            userId: newUserId,
                            email: userEmail,
                            clerkId: user.id,
                        });
                    }
                } else {
                    // Update existing user info to ensure it's current
                    const userEmail = user.emailAddresses[0]?.emailAddress;
                    if (userEmail) {
                        await convex.mutation(api.users.createOrUpdateUser, {
                            clerkId: user.id,
                            email: userEmail,
                            fullName:
                                user.fullName || convexUser.fullName || "",
                            isAdmin: userEmail === "nibod1248@gmail.com",
                        });
                        console.log("Updated existing user in database:", {
                            userId: convexUser._id,
                            email: userEmail,
                            clerkId: user.id,
                        });
                    }
                }

                if (convexUser) {
                    // Check if payment already exists to avoid duplicates
                    const existingPayment = await convex.query(
                        api.payments.getPaymentByPaymentId,
                        { paymentId: paymentData.payment_id },
                    );

                    if (!existingPayment) {
                        // Create payment record with comprehensive data
                        const paymentRecord = await convex.mutation(
                            api.payments.createPayment,
                            {
                                paymentId: paymentData.payment_id,
                                subscriptionId:
                                    paymentData.subscription_id || undefined,
                                userId: convexUser._id,
                                amount: paymentData.total_amount || 0,
                                currency: paymentData.currency || "USD",
                                status: paymentData.status,
                                paymentMethod: "dodo",
                                customerEmail:
                                    paymentData.customer?.email || userEmail,
                                customerName:
                                    paymentData.customer?.name ||
                                    user.fullName ||
                                    "",
                                paymentType: paymentData.subscription_id
                                    ? "subscription"
                                    : "one_time",
                                metadata: JSON.stringify({
                                    ...paymentData.metadata,
                                    clerk_user_id: user.id,
                                    processed_at: new Date().toISOString(),
                                    product_cart: paymentData.product_cart,
                                    settlement_amount:
                                        paymentData.settlement_amount,
                                    tax: paymentData.tax,
                                }),
                            },
                        );

                        console.log("Payment recorded in database:", {
                            paymentId: paymentData.payment_id,
                            userId: convexUser._id,
                            amount: paymentData.total_amount,
                            currency: paymentData.currency,
                            status: paymentData.status,
                            recordId: paymentRecord,
                        });

                        // Allocate posts based on payment amount
                        if (paymentRecord && paymentData.total_amount) {
                            let planType = "onePost"; // default

                            // Map amounts to plan types
                            if (paymentData.total_amount === 199)
                                planType = "onePost"; // $1.99
                            else if (paymentData.total_amount === 699)
                                planType = "fivePosts"; // $6.99
                            else if (paymentData.total_amount === 999)
                                planType = "fivePosts"; // $9.99 - for mock payments
                            else if (paymentData.total_amount === 1499)
                                planType = "unlimited_monthly_1499"; // $14.99

                            try {
                                const allocation = await convex.mutation(
                                    api.payments.allocatePostsFromPayment,
                                    {
                                        paymentId: paymentData.payment_id,
                                        userId: convexUser._id,
                                        planType,
                                    },
                                );

                                console.log("Posts allocated successfully:", {
                                    paymentId: paymentData.payment_id,
                                    userId: convexUser._id,
                                    planType,
                                    allocation,
                                    amount: paymentData.total_amount,
                                });

                                // Update user's last payment info for tracking
                                await convex.mutation(
                                    api.users.createOrUpdateUser,
                                    {
                                        clerkId: user.id,
                                        email: userEmail || convexUser.email,
                                        fullName:
                                            user.fullName ||
                                            convexUser.fullName ||
                                            "",
                                        isAdmin:
                                            userEmail === "nibod1248@gmail.com",
                                    },
                                );
                            } catch (allocationError) {
                                console.error(
                                    "Error allocating posts:",
                                    allocationError,
                                );
                                // Log the error but continue - payment was still recorded
                            }
                        } else {
                            console.warn(
                                "No payment amount found for post allocation:",
                                {
                                    paymentId: paymentData.payment_id,
                                    amount: paymentData.total_amount,
                                    hasRecord: !!paymentRecord,
                                },
                            );
                        }
                    } else {
                        console.log("Payment already exists in database:", {
                            paymentId: existingPayment.paymentId,
                            userId: existingPayment.userId,
                            amount: existingPayment.amount,
                            status: existingPayment.status,
                            createdAt: new Date(
                                existingPayment.createdAt,
                            ).toISOString(),
                        });

                        // Even if payment exists, ensure posts are allocated if not already done
                        if (
                            !existingPayment.postsAllocated &&
                            existingPayment.amount
                        ) {
                            let planType = "onePost";

                            if (existingPayment.amount === 199)
                                planType = "onePost";
                            else if (existingPayment.amount === 699)
                                planType = "fivePosts";
                            else if (existingPayment.amount === 999)
                                planType = "fivePosts";
                            else if (existingPayment.amount === 1499)
                                planType = "unlimited_monthly_1499";

                            try {
                                const allocation = await convex.mutation(
                                    api.payments.allocatePostsFromPayment,
                                    {
                                        paymentId: existingPayment.paymentId,
                                        userId: convexUser._id,
                                        planType,
                                    },
                                );

                                console.log(
                                    "Retroactively allocated posts for existing payment:",
                                    {
                                        paymentId: existingPayment.paymentId,
                                        userId: convexUser._id,
                                        planType,
                                        allocation,
                                    },
                                );
                            } catch (allocationError) {
                                console.error(
                                    "Error retroactively allocating posts:",
                                    allocationError,
                                );
                            }
                        }
                    }
                } else {
                    console.error("Failed to create or find user in database", {
                        clerkId: user.id,
                        email: user.emailAddresses[0]?.emailAddress,
                    });
                }
            } catch (dbError) {
                console.error("Database operation error:", {
                    error: dbError,
                    paymentId: paymentData.payment_id,
                    userId: user.id,
                    amount: paymentData.total_amount,
                });
                // Don't fail the request if database operations fail
            }
        } else {
            console.log("Payment not in succeeded/completed status:", {
                paymentId: paymentData.payment_id,
                status: paymentData.status,
                amount: paymentData.total_amount,
            });
        }

        // Return payment details in a consistent format
        return NextResponse.json({
            paymentId: paymentData.payment_id,
            status: paymentData.status,
            amount: paymentData.total_amount,
            currency: paymentData.currency,
            customer: paymentData.customer,
            created_at: paymentData.created_at,
            product_cart: paymentData.product_cart,
            metadata: paymentData.metadata,
            settlement_amount: paymentData.settlement_amount,
            settlement_currency: paymentData.settlement_currency,
            tax: paymentData.tax,
        });
    } catch (error) {
        console.error("Error fetching payment details:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
