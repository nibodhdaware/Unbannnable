// LTD Plan Configurations - Place this at the top of your AppPageContent function
const LTD_PLANS = [
    {
        id: "starter",
        title: "Starter Lifetime",
        price: "$19",
        credits: "20 credits/month",
        productId:
            process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID ||
            "YOUR_STARTER_PRODUCT_ID",
        monthlyCredits: 20,
        amount: 19,
        features: [
            "20 AI credits every month",
            "Good for 2-10 posts monthly",
            "Rule compliance checking",
            "Basic anomaly detection",
            "Flair suggestions",
            "Credits roll over if unused",
            "Lifetime access",
        ],
    },
    {
        id: "standard",
        title: "Standard Lifetime",
        price: "$39",
        credits: "100 credits/month",
        productId:
            process.env.NEXT_PUBLIC_DODO_STANDARD_PRODUCT_ID ||
            "YOUR_STANDARD_PRODUCT_ID",
        monthlyCredits: 100,
        amount: 39,
        popular: true,
        features: [
            "100 AI credits every month",
            "Perfect for 10-50 posts monthly",
            "All Starter features",
            "Advanced anomaly detection",
            "Smart flair suggestions",
            "Alternative subreddit finder",
            "Priority support",
            "Lifetime access",
        ],
    },
    {
        id: "pro",
        title: "Pro Lifetime",
        price: "$59",
        credits: "500 credits/month",
        productId:
            process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID ||
            "YOUR_PRO_PRODUCT_ID",
        monthlyCredits: 500,
        amount: 59,
        features: [
            "500 AI credits every month",
            "For 50-250 posts monthly",
            "All Standard features",
            "Unlimited rule checking",
            "Bulk post analysis",
            "API access (coming soon)",
            "Premium support",
            "Lifetime access",
        ],
    },
];
