import DodoPayments from "dodopayments";

export const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment:
        process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
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
    if (!process.env.DODO_PAYMENTS_API_KEY) {
        throw new Error("DodoPay API key not configured");
    }

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
            ...(params.phoneNumber && { phone_number: params.phoneNumber }),
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

    const apiUrl =
        process.env.NODE_ENV === "production"
            ? "https://live.dodopayments.com"
            : "https://test.dodopayments.com";

    const response = await fetch(`${apiUrl}/payments`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DodoPay API error: ${response.status} - ${errorText}`);
    }

    const payment = await response.json();
    return payment;
};
