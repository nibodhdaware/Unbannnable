import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface WebhookEvent {
    type: string;
    data: Record<string, unknown>;
}

function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload, "utf8")
        .digest("hex");

    // Handle both formats: "sha256=..." and just the hex string
    const receivedSignature = signature.startsWith("sha256=")
        ? signature.slice(7)
        : signature;

    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "hex"),
        Buffer.from(receivedSignature, "hex"),
    );
}

export async function POST(request: NextRequest) {
    try {
        const headersList = await headers();
        const signature = headersList.get("dodo-signature");

        const rawBody = await request.text();
        const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

        // Verify webhook signature
        if (!signature || !webhookSecret) {
            console.error("Missing signature or webhook secret");
            return NextResponse.json(
                { error: "Missing signature or webhook secret" },
                { status: 401 },
            );
        }

        if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 },
            );
        }

        const body: WebhookEvent = JSON.parse(rawBody);
        const { type, data } = body;

        console.log("Dodo webhook received:", { type, data });

        switch (type) {
            case "payment.succeeded":
                await handlePaymentEvent(data, "succeeded");
                break;

            case "payment.failed":
                await handlePaymentEvent(data, "failed");
                break;

            case "payment.pending":
                await handlePaymentEvent(data, "pending");
                break;

            case "payment.cancelled":
                await handlePaymentEvent(data, "cancelled");
                break;

            case "payment.refunded":
                await handleRefundEvent(data);
                break;

            case "payment.disputed":
                await handleDisputeEvent(data);
                break;

            default:
                console.log("Unhandled webhook event type:", type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 },
        );
    }
}

async function handlePaymentEvent(
    data: Record<string, unknown>,
    status: string,
) {
    try {
        const paymentId = data.payment_id as string;
        const amount = (data.amount || data.total_amount) as number;
        const currency = (data.currency as string) || "USD";
        const metadata = (data.metadata as Record<string, unknown>) || {};
        const clerkUserId =
            (metadata.clerk_user_id as string) ||
            (metadata.clerkId as string) ||
            "";

        // Try multiple possible fields for customer data
        const customerData = (data.customer as Record<string, unknown>) || {};
        const customerEmail = (data.customer_email ||
            customerData.email ||
            data.email) as string;
        const customerName = (data.customer_name ||
            customerData.name ||
            data.name) as string;

        if (!paymentId) {
            console.error("Missing payment ID in webhook data");
            return;
        }

        console.log("Processing payment event:", {
            paymentId,
            amount,
            currency,
            status,
            customerEmail,
            customerName,
            clerkUserId,
            fullData: data, // Log full data for debugging
        });

        // Find user by clerk ID if available
        let userId = null;
        if (clerkUserId) {
            console.log("Looking up user by clerk ID:", clerkUserId);
            const user = await convex.query(api.users.getUserByClerkId, {
                clerkId: clerkUserId,
            });

            if (user) {
                userId = user._id;
                console.log("Found user by clerk ID:", user._id);
            } else {
                console.log("User not found by clerk ID:", clerkUserId);
            }
        } else {
            console.log("No clerk user ID found in metadata");
        }

        // If we don't have a clerk user ID, try to find user by email
        if (!userId && customerEmail) {
            console.log("Looking up user by email:", customerEmail);

            // Try to find existing user by email
            const existingUser = await convex.query(api.users.getUserByEmail, {
                email: customerEmail,
            });

            if (existingUser) {
                userId = existingUser._id;
                console.log("Found existing user by email:", existingUser._id);
            } else {
                // Create new user record for this email
                console.log(
                    "Creating new user record for email:",
                    customerEmail,
                );
                userId = await convex.mutation(api.users.createOrUpdateUser, {
                    clerkId: `manual_${Date.now()}`, // Temporary clerk ID for manual payments
                    email: customerEmail,
                    fullName: customerName || "Unknown User",
                    isAdmin: customerEmail === "nibod1248@gmail.com",
                });
                console.log("Created new user:", userId);
            }
        }

        // Create payment record for all payment events
        const paymentRecord = await convex.mutation(
            api.payments.createPayment,
            {
                paymentId: paymentId,
                userId: userId,
                amount: amount || 1,
                currency: currency,
                status,
                paymentMethod: "dodo",
                customerEmail: customerEmail || undefined,
                customerName: customerName || undefined,
                paymentType: "one_time",
                metadata: JSON.stringify(metadata),
            },
        );

        console.log("Payment recorded successfully:", {
            paymentId,
            userId,
            amount,
            status,
            recordId: paymentRecord,
        });

        // Only allocate posts for successful payments
        if (status === "succeeded" || status === "completed") {
            // Allocate posts to user if payment is successful and user exists
            if (userId && paymentRecord) {
                try {
                    // Determine plan type from amount and currency
                    let planType = "onePost"; // default
                    const currency = (data.currency as string) || "USD";

                    console.log("Payment allocation details:", {
                        amount,
                        currency,
                        originalAmount: amount,
                    });

                    // Handle different currencies and amounts
                    if (currency === "USD" || currency === "INR") {
                        // For USD amounts (handle both cents and dollars)
                        if (amount === 100 || amount === 1)
                            planType = "tenPosts"; // $1.00 for 10 posts (100 cents or 1 dollar)
                        else if (amount === 500 || amount === 5)
                            planType = "hundredPosts"; // $5.00 for 100 posts (500 cents or 5 dollars)
                        else if (amount === 1500 || amount === 15)
                            planType = "fiveHundredPosts"; // $15.00 for 500 posts (1500 cents or 15 dollars)
                        else if (amount === 699)
                            planType = "fivePosts"; // $6.99 (legacy)
                        else if (amount === 1499)
                            planType = "unlimited_monthly_1499"; // $14.99 (legacy)
                        else if (amount === 999)
                            planType = "fivePosts"; // Mock payments
                        // Handle INR amounts (approximate conversion)
                        else if (amount >= 80 && amount <= 90)
                            planType = "hundredPosts"; // ~$5.00 USD equivalent in INR
                        else if (amount >= 15 && amount <= 25)
                            planType = "tenPosts"; // ~$1.00 USD equivalent in INR
                        else if (amount >= 1200 && amount <= 1300)
                            planType = "fiveHundredPosts"; // ~$15.00 USD equivalent in INR
                    }

                    console.log("Plan type determined:", {
                        amount,
                        currency,
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

                    console.log("Allocating posts for payment:", {
                        paymentId,
                        userId,
                        planType,
                        amount,
                    });

                    const allocation = await convex.mutation(
                        api.payments.allocatePostsFromPayment,
                        {
                            paymentId,
                            userId: userId as any, // userId is checked above
                            planType,
                        },
                    );

                    console.log("Posts allocated successfully:", {
                        paymentId,
                        userId,
                        planType,
                        allocation,
                    });
                } catch (allocationError) {
                    console.error("Error allocating posts:", allocationError);
                }
            }
        } else {
            console.log("Payment not in succeeded status:", {
                paymentId,
                status,
                customerEmail,
                amount,
            });
        }
    } catch (error) {
        console.error("Error handling payment event:", error);
    }
}

async function handleRefundEvent(data: Record<string, unknown>) {
    try {
        const paymentId = data.payment_id as string;
        const refundAmount = data.refund_amount as number;
        const refundId = data.refund_id as string;

        if (!paymentId) {
            console.error("Missing payment ID in refund webhook data");
            return;
        }

        console.log("Processing refund event:", {
            paymentId,
            refundAmount,
            refundId,
            fullData: data,
        });

        // Update payment status in database
        await convex.mutation(api.payments.updatePaymentStatus, {
            paymentId,
            status: "refunded",
            refundAmount,
            metadata: JSON.stringify({
                refundId,
                refundDate: new Date().toISOString(),
            }),
        });

        console.log("Refund processed successfully:", {
            paymentId,
            refundAmount,
            refundId,
        });

        // TODO: Implement business logic for refunds
        // - Revoke posts if needed
        // - Send notification to user
        // - Update user's post allocation
    } catch (error) {
        console.error("Error handling refund event:", error);
    }
}

async function handleDisputeEvent(data: Record<string, unknown>) {
    try {
        const paymentId = data.payment_id as string;
        const disputeId = data.dispute_id as string;
        const disputeReason = data.dispute_reason as string;

        if (!paymentId) {
            console.error("Missing payment ID in dispute webhook data");
            return;
        }

        console.log("Processing dispute event:", {
            paymentId,
            disputeId,
            disputeReason,
            fullData: data,
        });

        // Update payment status in database
        await convex.mutation(api.payments.updatePaymentStatus, {
            paymentId,
            status: "disputed",
            metadata: JSON.stringify({
                disputeId,
                disputeReason,
                disputeDate: new Date().toISOString(),
            }),
        });

        console.log("Dispute recorded successfully:", {
            paymentId,
            disputeId,
            disputeReason,
        });

        // TODO: Implement dispute handling logic
        // - Notify admin about dispute
        // - Temporarily suspend user's posts
        // - Send email notification
    } catch (error) {
        console.error("Error handling dispute event:", error);
    }
}
