# Credit System Implementation

## Overview

Simplified credit system with signup bonuses, referral rewards, and **one-time lifetime plans** with monthly credit refreshes.

## Credit Allocation

### Signup Bonus

- **10 credits** automatically given to every new user on signup
- Tracked via `hasReceivedSignupBonus` field

### Referral System

- **Referrer**: Gets 10 credits when someone signs up using their referral code
- **Referee** (New user): Gets 10 credits bonus (20 total: 10 signup + 10 referral)
- Each user gets a unique referral code (last 8 chars of their Clerk ID)
- Tracked via `referralCount` and `referredBy` fields

### Lifetime Plans (One-Time Payment)

#### Basic Plan - $19 ONE-TIME

- **20 credits per month** - FOREVER
- One-time payment, no recurring charges
- Tracked via `lifetimePlan: "basic"`

#### Premium Plan - $39 ONE-TIME

- **100 credits per month** - FOREVER
- One-time payment, no recurring charges
- Tracked via `lifetimePlan: "premium"`

**How Monthly Refresh Works:**

- Credits automatically added every 30 days
- Tracked via `lastMonthlyRefreshDate`
- User can trigger refresh or it happens automatically
- Credits accumulate (don't expire)

## Database Schema

### Users Table (ONLY TABLE NEEDED)

```typescript
clerkId: v.string(),
email: v.string(),
totalPurchasedPosts: v.optional(v.number()), // Current credit balance

// Referral system
referralCode: v.optional(v.string()), // User's unique code
referredBy: v.optional(v.string()), // Who referred them
referralCount: v.optional(v.number()), // Successful referrals
hasReceivedSignupBonus: v.optional(v.boolean()), // Signup bonus given

// Lifetime Plan tracking
lifetimePlan: v.optional(v.string()), // "basic" or "premium"
lifetimePlanPurchaseDate: v.optional(v.number()), // When purchased
lastMonthlyRefreshDate: v.optional(v.number()), // Last credit refresh
```

### Posts Table

No changes needed - just tracks which posts were created and credits spent on AI features.

## Key Functions

### `createOrUpdateUser` (convex/users.ts)

- Automatically gives 10 credits on signup
- Handles referral code from URL
- Awards both referrer and referee

### `purchaseLifetimePlan` (convex/users.ts)

- Called when user pays $19 or $39
- Sets up lifetime plan in user record
- Adds initial monthly credits immediately
- Records purchase date for tracking

### `refreshMonthlyCredits` (convex/users.ts)

- Checks if 30 days have passed since last refresh
- Adds 20 or 100 credits based on plan
- Updates `lastMonthlyRefreshDate`
- Can be called manually or by cron job

### `getLifetimePlanInfo` (convex/users.ts)

- Returns user's lifetime plan details
- Shows days until next credit refresh
- Indicates if credits can be refreshed now

### `getReferralStats` (convex/users.ts)

- Returns referral code, count, and total earned
- Used by ReferralSection component

## Components

### `ReferralHandler.tsx`

- Client component that reads `?ref=CODE` from URL
- Automatically syncs user with referral code on signup
- Should be in root layout for all pages

### `ReferralSection.tsx`

- Displays referral stats from database
- Shows referral code and link
- Copy/share functionality

## Usage Flow

### New User Signup

1. User visits `/?ref=ABCD1234`
2. Signs up with Clerk
3. `ReferralHandler` detects referral code
4. `createOrUpdateUser` is called with referral code
5. New user gets 20 credits (10 signup + 10 referral)
6. Referrer gets 10 credits

### Lifetime Plan Purchase

1. User pays $19 or $39 **ONE-TIME**
2. `purchaseLifetimePlan` is called with amount
3. Function detects plan based on amount:
    - $19 (1900 cents) = basic plan (20 credits/month)
    - $39 (3900 cents) = premium plan (100 credits/month)
4. User gets initial credits immediately
5. `lifetimePlan` and `lifetimePlanPurchaseDate` recorded
6. User will get credits every 30 days forever

### Monthly Credit Refresh

1. After 30 days, user can refresh or cron job triggers it
2. `refreshMonthlyCredits` checks last refresh date
3. Adds 20 or 100 credits based on lifetime plan
4. Updates `lastMonthlyRefreshDate`
5. Repeats every 30 days - NO CANCELLATION NEEDED

## Implementation Details

### Payment Flow (Success Page)

```typescript
// User completes payment for $19 or $39
const amountCents = 1900; // or 3900
const result = await purchaseLifetimePlan({
    clerkId: user.id,
    amount: amountCents,
});
// Returns: { success, plan, creditsAdded, newTotal, message }
```

### Checking Plan Status

```typescript
const planInfo = await getLifetimePlanInfo({ clerkId: user.id });
// Returns: { hasLifetimePlan, plan, monthlyCredits, daysUntilNextRefresh, canRefreshNow }
```

### Triggering Credit Refresh

```typescript
const result = await refreshMonthlyCredits({ clerkId: user.id });
// Returns: { refreshed, creditsAdded, newTotal, plan } or { refreshed: false, reason }
```

## Advantages of Lifetime Plans

1. **Simple**: One payment, credits forever
2. **No Subscriptions**: No recurring billing to manage
3. **User-Friendly**: Users pay once and never worry again
4. **Predictable**: Users know exactly what they'll get each month
5. **Flexible**: Credits accumulate if not used

## Testing

### Test Signup Bonus

1. Create new account → Check user has 10 credits immediately

### Test Referral

1. Get referral code from existing user
2. Create new account with `/?ref=CODE`
3. Check both users get 10 credits each

### Test Lifetime Plans

1. Pay $19 → Check user gets 20 credits and basic plan
2. Pay $39 → Check user gets 100 credits and premium plan
3. Wait 30 days (or modify date) → Refresh → Check credits added
4. Verify plan persists and refreshes continue

## Migration Notes

If you have existing users:

1. Run script to generate referral codes for all users
2. Give existing users 10 credit signup bonus if needed
3. Set `hasReceivedSignupBonus: true` for existing users
4. Existing payment records can be migrated or left as-is

## No Need For

- ❌ Payments table (everything in users table)
- ❌ Subscription management
- ❌ Cancellation handling
- ❌ Payment renewal webhooks
- ❌ Complex billing logic

## What You Still Need

- ✅ Cron job to check and refresh credits every day
- ✅ Payment webhook to call `purchaseLifetimePlan`
- ✅ UI to show plan status and next refresh date
