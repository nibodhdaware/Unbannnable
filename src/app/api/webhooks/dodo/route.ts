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
        const clerkUserId = (metadata.clerk_user_id as string) || "";

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
            const user = await convex.query(api.users.getUserByClerkId, {
                clerkId: clerkUserId,
            });

            if (user) {
                userId = user._id;
            }
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

        // Create payment record for successful payments
        if (status === "succeeded" || status === "completed") {
            const paymentRecord = await convex.mutation(
                api.payments.createPayment,
                {
                    paymentId: paymentId,
                    userId: userId,
                    amount: amount || 199,
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

            // Allocate posts to user if payment is successful and user exists
            if (userId && paymentRecord) {
                try {
                    // Determine plan type from amount
                    let planType = "onePost"; // default

                    if (amount === 199)
                        planType = "onePost"; // $1.99
                    else if (amount === 699)
                        planType = "fivePosts"; // $6.99
                    else if (amount === 1499)
                        planType = "unlimited_monthly_1499"; // $14.99

                    const allocation = await convex.mutation(
                        api.payments.allocatePostsFromPayment,
                        {
                            paymentId,
                            userId,
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
