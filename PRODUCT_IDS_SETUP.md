# 🎯 QUICK START: Update Product IDs

## Step 1: Add to .env.local

```bash
# Add these 3 lines to your .env.local file:
NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID=your_starter_product_id_here
NEXT_PUBLIC_DODO_STANDARD_PRODUCT_ID=your_standard_product_id_here
NEXT_PUBLIC_DODO_PRO_PRODUCT_ID=your_pro_product_id_here
```

## Step 2: Restart Dev Server

```bash
# Stop your current server and restart it
npm run dev
```

That's it! The product IDs will be automatically loaded from environment variables.

## ✅ How It Works

The code already uses `process.env.NEXT_PUBLIC_DODO_*_PRODUCT_ID` in:

- `src/components/PricingSection.tsx` (Landing page pricing)
- `src/app/app/page.tsx` (App pricing popup)

So you ONLY need to update `.env.local` - no code changes required!

## 🔍 Verify It's Working

1. Start dev server: `npm run dev`
2. Open browser console
3. Check Network tab when clicking "Buy Now"
4. Verify `product_cart[0].product_id` matches your Dodo product ID

## 📦 Pricing Tiers

| Tier        | Price | Monthly Credits   | Product ID Env Var                     |
| ----------- | ----- | ----------------- | -------------------------------------- |
| Starter     | $19   | 20 credits/month  | `NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID`  |
| Standard ⭐ | $39   | 100 credits/month | `NEXT_PUBLIC_DODO_STANDARD_PRODUCT_ID` |
| Pro         | $59   | 500 credits/month | `NEXT_PUBLIC_DODO_PRO_PRODUCT_ID`      |

## ⚠️ Important Notes

- **Must be NEXT*PUBLIC*\*** - These env vars are used in client-side code
- **Restart required** - Environment variables are loaded at build time
- **No fallbacks in production** - Make sure to set these in your production environment (Vercel, etc.)

## 🚀 Production Deployment

When deploying to Vercel/production:

1. Go to your project settings
2. Add the 3 environment variables
3. Redeploy your application

The same environment variable names work in both development and production.

---

For detailed implementation info, see `LTD_PRICING_SETUP.md`
