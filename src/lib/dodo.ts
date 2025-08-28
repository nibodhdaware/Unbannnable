import DodoPayments from "dodopayments";

export const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: "live_mode",
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
        const mappedProductCart = params.productCart.map((item) => {
            const mapped = {
                product_id: item.productId,
                quantity: item.quantity,
                amount: item.amount || 0,
            };
            return mapped;
        });

        const payment = await dodoClient.payments.create({
            customer: {
                email: params.email,
                name: params.name,
                phone_number: params.phoneNumber,
                create_new_customer: true,
            },
            billing: {
                city: params.city,
                country: params.country as any,
                state: params.state,
                street: params.street,
                zipcode: params.zipcode,
            },
            product_cart: mappedProductCart,
            payment_link: true,
            return_url:
                process.env.NEXT_PUBLIC_RETURN_URL ||
                "https://unbannnable.com/success",
            metadata: {
                userId: params.userId,
                clerkId: params.clerkId,
            },
        });

        return payment;
    } catch (error: any) {
        console.error("Error using DodoPay SDK:", error);
        // Re-throw the error to be caught by the API route handler
        throw new Error(
            `DodoPay SDK error: ${error.message || "An unknown error occurred"}`,
        );
    }
};
