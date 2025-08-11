import DodoPayments from "dodopayments";

console.log("Dodo client initialization:", {
    apiKeySet: !!process.env.DODO_PAYMENTS_API_KEY,
    apiKeyLength: process.env.DODO_PAYMENTS_API_KEY?.length,
    environment: process.env.NODE_ENV,
});

export const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: "test_mode", // Always use test mode for now to debug
});

export interface CreateOneTimePaymentParams {
    email: string;
    name: string;
    phoneNumber?: string;
    city: string;
    state: string;
    country: string;
    street: string;
    zipcode: string;
    productCart: {
        productId: string;
        quantity: number;
        amount?: number; // Amount in cents for pay-what-you-want products
    }[];
    userId: string;
    clerkId: string;
}

export const createOneTimePaymentLink = async (
    params: CreateOneTimePaymentParams,
) => {
    try {
        console.log("API Key available:", !!process.env.DODO_PAYMENTS_API_KEY);
        console.log(
            "API Key starts with:",
            process.env.DODO_PAYMENTS_API_KEY?.substring(0, 10),
        );
        console.log("Environment:", process.env.NODE_ENV);

        console.log("Creating payment with params:", {
            billing: params.city + ", " + params.state + ", " + params.country,
            customer: params.email,
            productCart: params.productCart,
            apiKey: process.env.DODO_PAYMENTS_API_KEY
                ? `${process.env.DODO_PAYMENTS_API_KEY.substring(0, 10)}...`
                : "Not set",
        });

        const paymentPayload = {
            billing: {
                city: params.city,
                country: params.country as any,
                state: params.state,
                street: params.street,
                zipcode: params.zipcode,
            },
            customer: {
                email: params.email,
                name: params.name,
                create_new_customer: true,
            },
            product_cart: params.productCart.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                ...(item.amount && { amount: item.amount }),
            })),
            payment_link: true,
            return_url:
                process.env.NEXT_PUBLIC_RETURN_URL ||
                "https://unbannnable.com/success",
            metadata: {
                userId: params.userId,
                clerkId: params.clerkId,
            },
        };

        // Add phone number only if provided
        if (params.phoneNumber) {
            (paymentPayload.customer as any).phone_number = params.phoneNumber;
        }

        console.log(
            "Payment payload being sent:",
            JSON.stringify(paymentPayload, null, 2),
        );

        // Try direct API call instead of SDK
        const response = await fetch("https://test.dodopayments.com/payments", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentPayload),
        });

        console.log("DodoPay API response status:", response.status);
        console.log(
            "DodoPay API response headers:",
            Object.fromEntries(response.headers.entries()),
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("DodoPay API error response:", errorText);
            throw new Error(
                `DodoPay API error: ${response.status} - ${errorText}`,
            );
        }

        const payment = await response.json();
        console.log("Payment created successfully:", payment);

        return payment;
    } catch (error) {
        console.error("Error creating one-time payment:", error);

        // If it's a 401 error or product not found, let's provide more specific debugging
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                apiKeySet: !!process.env.DODO_PAYMENTS_API_KEY,
                apiKeyLength: process.env.DODO_PAYMENTS_API_KEY?.length,
                environment: process.env.NODE_ENV,
                apiKeyPrefix: process.env.DODO_PAYMENTS_API_KEY?.substring(
                    0,
                    10,
                ),
            });

            // Return a development mock if API fails
            if (process.env.NODE_ENV === "development") {
                console.log("Falling back to mock payment due to API error");
                const mockPaymentId = `mock_payment_${Date.now()}`;
                return {
                    payment_id: mockPaymentId,
                    payment_link: `http://localhost:3000/success?payment_id=${mockPaymentId}&status=mock_success`,
                    total_amount: params.productCart.reduce(
                        (sum, item) => sum + (item.amount || 199),
                        0,
                    ),
                    client_secret: `cs_mock_${mockPaymentId}`,
                    customer: {
                        customer_id: `mock_customer_${Date.now()}`,
                        email: params.email,
                        name: params.name,
                    },
                    metadata: {
                        userId: params.userId,
                        clerkId: params.clerkId,
                    },
                };
            }
        }

        throw error;
    }
};
