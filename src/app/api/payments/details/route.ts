import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { dodoClient } from "@/lib/dodo";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const paymentId =
            searchParams.get("paymentId") || searchParams.get("payment_id");

        if (!paymentId) {
            return NextResponse.json(
                { error: "Payment ID is required" },
                { status: 400 },
            );
        }

        const payment = await dodoClient.payments.retrieve(paymentId);

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 },
            );
        }

        // Debug: Log the full payment object to understand its structure
        console.log(
            "Full DodoPay payment object:",
            JSON.stringify(payment, null, 2),
        );

        return NextResponse.json({
            paymentId: (payment as any).payment_id || (payment as any).id,
            status: payment.status,
            amount:
                (payment as any).amount || (payment as any).total_amount || 0,
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
