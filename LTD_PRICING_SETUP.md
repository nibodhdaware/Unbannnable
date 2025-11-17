# LTD Pricing Configuration Guide

## 🎯 Product ID Configuration

You need to update your Dodo Payments product IDs in **TWO locations**:

### 1. Environment Variables (.env.local)

Add these environment variables to your `.env.local` file:

```bash
# Dodo Payments LTD Product IDs
NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID=your_starter_product_id_here
NEXT_PUBLIC_DODO_STANDARD_PRODUCT_ID=your_standard_product_id_here
NEXT_PUBLIC_DODO_PRO_PRODUCT_ID=your_pro_product_id_here
```

### 2. Component Files

#### File: `src/components/PricingSection.tsx`

Lines ~125-175 contain the plan configurations. Update the `productId` values:

```typescript
const plans = [
    {
        id: "starter",
        // ... other config
        productId:
            process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID ||
            "YOUR_STARTER_PRODUCT_ID",
        // ☝️ Replace 'YOUR_STARTER_PRODUCT_ID' with your actual Dodo product ID
    },
    {
        id: "standard",
        // ... other config
        productId:
            process.env.NEXT_PUBLIC_DODO_STANDARD_PRODUCT_ID ||
            "YOUR_STANDARD_PRODUCT_ID",
        // ☝️ Replace 'YOUR_STANDARD_PRODUCT_ID' with your actual Dodo product ID
    },
    {
        id: "pro",
        // ... other config
        productId:
            process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID ||
            "YOUR_PRO_PRODUCT_ID",
        // ☝️ Replace 'YOUR_PRO_PRODUCT_ID' with your actual Dodo product ID
    },
];
```

#### File: `src/app/app/page.tsx`

Lines ~3900-4000 contain the pricing popup. Update the `handleGetStarted` calls:

```typescript
// Starter Plan button
handleGetStarted(
    "starter",
    process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID ||
        "YOUR_STARTER_PRODUCT_ID",
    20,
    19,
);

// Standard Plan button
handleGetStarted(
    "standard",
    process.env.NEXT_PUBLIC_DODO_STANDARD_PRODUCT_ID ||
        "YOUR_STANDARD_PRODUCT_ID",
    100,
    39,
);

// Pro Plan button
handleGetStarted(
    "pro",
    process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID || "YOUR_PRO_PRODUCT_ID",
    500,
    59,
);
```

---

## 📦 LTD Pricing Structure

### Tier 1: Starter Lifetime - $19

- **Monthly Credits**: 20 credits
- **Best For**: Individuals, casual Reddit posters (2-10 posts/month)
- **Features**:
    - 20 AI credits every month
    - Rule compliance checking
    - Basic anomaly detection
    - Flair suggestions
    - Credits roll over if unused
    - Lifetime access

### Tier 2: Standard Lifetime - $39 ⭐ **Best Seller**

- **Monthly Credits**: 100 credits
- **Best For**: Creators, marketers, startup founders (10-50 posts/month)
- **Features**:
    - 100 AI credits every month
    - All Starter features
    - Advanced anomaly detection
    - Smart flair suggestions
    - Alternative subreddit finder
    - Priority support
    - Lifetime access

### Tier 3: Pro Lifetime - $59

- **Monthly Credits**: 500 credits
- **Best For**: Agencies, ghostwriters, growth hackers, SMMs (50-250 posts/month)
- **Features**:
    - 500 AI credits every month
    - All Standard features
    - Unlimited rule checking
    - Bulk post analysis
    - API access (coming soon)
    - Premium support
    - Lifetime access

---

## 🏗️ Database Schema Changes

### Users Table - New LTD Fields:

```typescript
ltdPlan: v.optional(v.string()), // "starter", "standard", "pro"
ltdPurchaseDate: v.optional(v.number()), // When they bought LTD
ltdMonthlyCredits: v.optional(v.number()), // Monthly credit allocation (20, 100, 500)
ltdLastAllocationDate: v.optional(v.number()), // Last time monthly credits were added
ltdRolloverCredits: v.optional(v.number()), // Unused credits that roll over
```

### Payments Table - New LTD Fields:

```typescript
isLTD: v.optional(v.boolean()), // Is this an LTD purchase?
ltdMonthlyCredits: v.optional(v.number()), // Monthly credits for this LTD plan
```

---

## 🔄 Payment Flow

1. User clicks "Buy Now" on any tier
2. `handleGetStarted(planType, productId, credits, amount)` is called with:

    - `planType`: 'starter' | 'standard' | 'pro'
    - `productId`: Your Dodo Payments product ID
    - `credits`: Monthly credit allocation (20, 100, or 500)
    - `amount`: Price in dollars (19, 39, or 59)

3. Payment API (`/api/create-payment`) receives:

```json
{
  "planType": "standard",
  "productId": "your_dodo_product_id",
  "credits": 100,
  "amount": 39,
  "billing": { ... },
  "customer": { ... }
}
```

4. Payment metadata includes:

```json
{
    "userId": "user_xxx",
    "planType": "standard",
    "credits": "100",
    "amount": "39"
}
```

5. On successful payment, the `/success` page should:
    - Parse payment metadata
    - Update user's LTD plan fields
    - Allocate initial monthly credits
    - Set `ltdLastAllocationDate` to current date

---

## ✅ TODO: Implement Credit Allocation Logic

You'll need to create a Convex function that runs monthly to allocate credits:

```typescript
// convex/crons.ts or similar
export const allocateMonthlyLTDCredits = mutation({
    handler: async (ctx) => {
        const now = Date.now();
        const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

        // Find all LTD users who haven't received credits this month
        const ltdUsers = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.neq(q.field("ltdPlan"), undefined),
                    q.or(
                        q.eq(q.field("ltdLastAllocationDate"), undefined),
                        q.lt(q.field("ltdLastAllocationDate"), oneMonthAgo),
                    ),
                ),
            )
            .collect();

        for (const user of ltdUsers) {
            const monthlyCredits = user.ltdMonthlyCredits || 0;
            const currentCredits = user.totalPurchasedPosts || 0;

            await ctx.db.patch(user._id, {
                totalPurchasedPosts: currentCredits + monthlyCredits,
                ltdLastAllocationDate: now,
                updatedAt: now,
            });
        }
    },
});
```

---

## 🚀 Next Steps

1. **Get your Dodo Payments product IDs**:

    - Log into Dodo Payments dashboard
    - Create 3 products for the LTD tiers
    - Copy the product IDs

2. **Update environment variables**:

    - Add the 3 product IDs to `.env.local`
    - Restart your dev server

3. **Test the payment flow**:

    - Click "Buy Now" on each tier
    - Verify correct product ID is sent to Dodo
    - Check payment metadata includes plan details

4. **Implement success page logic**:

    - Update `/success/page.tsx` to handle LTD purchases
    - Set user's LTD fields in database
    - Allocate initial monthly credits

5. **Set up monthly credit allocation**:
    - Create Convex cron job or scheduled function
    - Run monthly to allocate credits to LTD users
    - Handle credit rollovers

---

## 📝 Notes

- **Credits Never Expire**: Unused credits roll over month-to-month
- **Lifetime Access**: One-time payment, credits allocated every month forever
- **No Subscriptions**: Payment is one-time, not recurring
- **Credit Tracking**: Use `totalPurchasedPosts` field for available credits
- **Plan Identification**: Use `ltdPlan` field to identify which tier user purchased

---

## 🔍 Debugging Tips

If payments aren't working:

1. Check environment variables are loaded:

    ```javascript
    console.log(
        "Starter Product ID:",
        process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID,
    );
    ```

2. Check payment API request payload in Network tab

3. Verify Dodo Payments webhook is receiving metadata

4. Check Convex database after successful payment to ensure LTD fields are set

---

## 📧 Support

If you encounter issues:

- Check Dodo Payments documentation
- Verify all product IDs are correct
- Ensure `.env.local` is loaded (restart dev server)
- Check browser console for errors
- Review payment API logs

---

**Last Updated**: November 17, 2025
