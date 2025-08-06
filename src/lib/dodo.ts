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
    }[];
    userId: string;
    clerkId: string;
}

export const createOneTimePaymentLink = async (
    params: CreateOneTimePaymentParams,
) => {
    try {
        const response = await dodoClient.payments.create({
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
            product_cart: params.productCart.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
            })),
            payment_link: true,
            return_url: `${process.env.NEXT_PUBLIC_RETURN_URL!}?payment_id={payment_id}`,
            metadata: {
                userId: params.userId,
                clerkId: params.clerkId,
            },
        });

        return response;
    } catch (error) {
        console.error("Error creating one-time payment:", error);
        throw error;
    }
};
