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
            case "subscription.active":
            case "subscription.created":
                await handleSubscriptionEvent(data, "active");
                break;

            case "subscription.renewed":
                await handleSubscriptionEvent(data, "active");
                break;

            case "subscription.on_hold":
                await handleSubscriptionEvent(data, "past_due");
                break;

            case "subscription.failed":
                await handleSubscriptionEvent(data, "canceled");
                break;

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

async function handleSubscriptionEvent(
    data: Record<string, unknown>,
    status: string,
) {
    try {
        const subscriptionId = data.subscription_id as string;
        const metadata = (data.metadata as Record<string, unknown>) || {};
        const clerkUserId = (metadata.clerk_user_id as string) || "";
        const customerEmail = data.customer_email as string;
        const customerName = data.customer_name as string;
        const amount = data.amount as number;

        if (!subscriptionId) {
            console.error("No subscription ID in webhook data");
            return;
        }

        console.log("Processing subscription event:", {
            subscriptionId,
            status,
            customerEmail,
            customerName,
            clerkUserId,
            amount,
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

        // If we don't have a clerk user ID, try to handle by email
        if (!userId && customerEmail) {
            console.log(
                "Looking up user by email for subscription:",
                customerEmail,
            );
            if (customerEmail === "nibod1248@gmail.com") {
                // This is the admin user, ensure they exist
                await convex.mutation(api.users.createOrUpdateUser, {
                    clerkId: "manual_admin", // Temporary clerk ID for manual payments
                    email: customerEmail,
                    fullName: customerName || "Admin User",
                    isAdmin: true,
                });

                const user = await convex.query(api.users.getUserByClerkId, {
                    clerkId: "manual_admin",
                });

                if (user) {
                    userId = user._id;
                }
            }
        }

        // Create a payment record for successful subscriptions
        if (userId && (status === "active" || status === "renewed")) {
            await convex.mutation(api.payments.createPayment, {
                paymentId: `sub_${subscriptionId}`, // Prefix to distinguish from regular payments
                subscriptionId: subscriptionId,
                userId: userId,
                amount: amount || 199,
                currency: "USD",
                status: "succeeded", // Subscription events are considered successful payments
                paymentMethod: "dodo",
            });

            console.log(
                "Subscription event processed:",
                subscriptionId,
                status,
            );
        } else if (userId) {
            console.log(
                "Subscription status change processed:",
                subscriptionId,
                status,
            );
        } else {
            console.warn(
                "No user found for subscription event:",
                subscriptionId,
                customerEmail,
            );
        }
    } catch (error) {
        console.error("Error handling subscription event:", error);
    }
}

async function handlePaymentEvent(
    data: Record<string, unknown>,
    status: string,
) {
    try {
        const paymentId = data.payment_id as string;
        const subscriptionId = data.subscription_id as string;
        const amount = data.amount as number;
        const metadata = (data.metadata as Record<string, unknown>) || {};
        const clerkUserId = (metadata.clerk_user_id as string) || "";
        const customerEmail = data.customer_email as string;
        const customerName = data.customer_name as string;

        if (!paymentId) {
            console.error("Missing payment ID in webhook data");
            return;
        }

        console.log("Processing payment event:", {
            paymentId,
            amount,
            status,
            customerEmail,
            customerName,
            clerkUserId,
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
            // We'll need to create a function to find user by email
            // For now, let's create/update user if we have email
            if (customerEmail === "nibod1248@gmail.com") {
                // This is the admin user, ensure they exist
                await convex.mutation(api.users.createOrUpdateUser, {
                    clerkId: "manual_admin", // Temporary clerk ID for manual payments
                    email: customerEmail,
                    fullName: customerName || "Admin User",
                    isAdmin: true,
                });

                const user = await convex.query(api.users.getUserByClerkId, {
                    clerkId: "manual_admin",
                });

                if (user) {
                    userId = user._id;
                }
            }
        }

        // Create payment record (even if no user found, for tracking)
        if (userId) {
            await convex.mutation(api.payments.createPayment, {
                paymentId: paymentId,
                subscriptionId: subscriptionId || undefined,
                userId: userId,
                amount: amount || 199,
                currency: "USD",
                status,
                paymentMethod: "dodo",
            });

            console.log("Payment event processed for user:", paymentId, status);
        } else {
            console.log("Payment received but no user found:", {
                paymentId,
                customerEmail,
                amount,
                status,
            });
            // Still log the payment attempt for manual review
        }
    } catch (error) {
        console.error("Error handling payment event:", error);
    }
}
