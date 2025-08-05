import DodoPayments from "dodopayments";

export const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
});

export interface CreateSubscriptionParams {
    email: string;
    name: string;
    phoneNumber?: string;
    city: string;
    state: string;
    country: string;
    street: string;
    zipcode: string;
    productId: string;
    quantity?: number;
}

export const createSubscriptionPaymentLink = async (
    params: CreateSubscriptionParams,
) => {
    try {
        const subscription = await dodoClient.subscriptions.create({
            billing: {
                city: params.city,
                country: params.country as any, // Type assertion for country code
                state: params.state,
                street: params.street,
                zipcode: params.zipcode,
            },
            customer: {
                email: params.email,
                name: params.name,
                phone_number: params.phoneNumber,
            },
            product_id: params.productId,
            payment_link: true,
            return_url: process.env.NEXT_PUBLIC_RETURN_URL!,
            quantity: params.quantity || 1,
        });

        return subscription;
    } catch (error) {
        console.error("Error creating subscription:", error);
        throw error;
    }
};
