import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { dodoClient } from "@/lib/dodo";

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

        console.log("Fetching payment details for:", paymentId);

        // Fetch payment details from Dodo
        const payment = await dodoClient.payments.retrieve(paymentId);

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 },
            );
        }

        console.log("Payment details from Dodo:", {
            paymentId: payment.payment_id,
            status: payment.status,
            amount: payment.total_amount,
            customerEmail: payment.customer?.email,
            userEmail: user.emailAddresses[0]?.emailAddress,
        });

        // Validate that the payment belongs to the current user
        const paymentEmail = payment.customer?.email;
        const userEmail = user.emailAddresses[0]?.emailAddress;

        if (paymentEmail && userEmail && paymentEmail !== userEmail) {
            console.log("Payment access denied:", {
                paymentEmail,
                userEmail,
                paymentId,
            });

            return NextResponse.json(
                {
                    error: "Access denied",
                    details: {
                        paymentEmail,
                        userEmail,
                        message: "This payment belongs to a different user",
                    },
                },
                { status: 403 },
            );
        }

        // Return payment details
        return NextResponse.json({
            paymentId: payment.payment_id,
            status: payment.status,
            amount: payment.total_amount,
            currency: payment.currency,
            customer: payment.customer,
            created_at: payment.created_at,
            product_cart: payment.product_cart,
            metadata: payment.metadata,
        });
    } catch (error) {
        console.error("Error fetching payment details:", error);
        return NextResponse.json(
            { error: "Failed to fetch payment details" },
            { status: 500 },
        );
    }
}
