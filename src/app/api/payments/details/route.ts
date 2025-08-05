import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

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

        const response = await fetch(`${dodoApiUrl}/payments/${paymentId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Dodo API error:", response.status, errorText);
            return NextResponse.json(
                {
                    error: "Failed to fetch payment details",
                    details: errorText,
                },
                { status: response.status },
            );
        }

        const paymentData = await response.json();
        console.log("Fetched payment data:", paymentData);

        // Validate that this payment belongs to the current user
        const userEmail = user.emailAddresses[0]?.emailAddress;
        if (paymentData.customer.email !== userEmail) {
            return NextResponse.json(
                { error: "Payment does not belong to current user" },
                { status: 403 },
            );
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
