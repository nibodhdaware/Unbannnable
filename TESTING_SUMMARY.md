# Credit System Testing Summary

## Quick Test Commands

### 1. Start Services

```bash
# Terminal 1: Start Convex
npx convex dev

# Terminal 2: Start Next.js
npm run dev
```

### 2. Test API Endpoint (Check Eligible Users)

```bash
curl -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
```

### 3. Test Credit Refresh

```bash
curl -X POST -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
```

## Manual Database Testing (Convex Dashboard)

### Create Test User

Go to: https://dashboard.convex.dev → Your Project → Data → users → Add Document

```json
{
    "clerkId": "test_user_001",
    "email": "test@unbannnable.com",
    "fullName": "Test User",
    "totalPurchasedPosts": 50,
    "lifetimePlan": "premium",
    "lifetimePlanPurchaseDate": 1668960000000,
    "lastMonthlyRefreshDate": 1668960000000,
    "referralCode": "TEST0001",
    "referralCount": 0,
    "hasReceivedSignupBonus": true,
    "createdAt": 1700000000000,
    "updatedAt": 1700000000000
}
```

This user has:

- ✅ Premium plan ($39 one-time)
- ✅ 50 current credits
- ✅ Last refresh 30+ days ago (eligible!)

### Test Functions in Dashboard

**Functions → users:createOrUpdateUser**

```json
{
    "clerkId": "new_user_002",
    "email": "new@example.com",
    "fullName": "New User"
}
```

Expected: User gets 10 credits (signup bonus)

**Functions → users:purchaseLifetimePlan**

```json
{
    "clerkId": "test_user_001",
    "amount": 3900
}
```

Expected: User gets premium plan + 100 credits

**Functions → users:refreshMonthlyCredits**

```json
{
    "clerkId": "test_user_001"
}
```

Expected: User gets 100 more credits (premium = 100/month)

## What Each Test Validates

| Test                           | What It Checks       | Expected Result    |
| ------------------------------ | -------------------- | ------------------ |
| GET /api/cron/refresh-credits  | Finds eligible users | `eligibleCount: 1` |
| POST /api/cron/refresh-credits | Adds credits         | `refreshed: 1`     |
| createOrUpdateUser             | Signup bonus         | 10 credits added   |
| purchaseLifetimePlan($1900)    | Basic plan           | 20 credits/month   |
| purchaseLifetimePlan($3900)    | Premium plan         | 100 credits/month  |
| refreshMonthlyCredits          | Monthly refresh      | Credits added      |
| createOrUpdateUser (with ref)  | Referral bonus       | Both users get 10  |

## Database Verification Checklist

After running tests, check Convex Dashboard:

### users table

- [ ] New users have `totalPurchasedPosts: 10` (signup bonus)
- [ ] Users with referrals have `totalPurchasedPosts: 20` (10 + 10)
- [ ] Users with `lifetimePlan: "basic"` exist
- [ ] Users with `lifetimePlan: "premium"` exist
- [ ] `lastMonthlyRefreshDate` updates after refresh
- [ ] `referralCode` generated for all users
- [ ] `referralCount` increments when users refer

### Refresh Logic

- [ ] User with 30+ day old refresh gets credits
- [ ] User with < 30 day refresh is skipped
- [ ] Basic plan gets 20 credits
- [ ] Premium plan gets 100 credits
- [ ] Credits accumulate (don't reset)

## Expected Flow

### New User Signup

```
User signs up
  → createOrUpdateUser called
  → totalPurchasedPosts = 10 ✅
  → referralCode generated ✅
  → hasReceivedSignupBonus = true ✅
```

### User Buys Lifetime Plan

```
User pays $19 or $39
  → purchaseLifetimePlan called
  → lifetimePlan = "basic" or "premium" ✅
  → Initial credits added (20 or 100) ✅
  → lifetimePlanPurchaseDate set ✅
  → lastMonthlyRefreshDate set ✅
```

### Monthly Credit Refresh (Automatic)

```
Cron runs daily
  → batchRefreshCredits called
  → Finds users where lastRefreshDate > 30 days ago
  → Adds 20 (basic) or 100 (premium) credits ✅
  → Updates lastMonthlyRefreshDate ✅
  → Repeats every 30 days forever ✅
```

### Referral System

```
User A shares: /?ref=ABC123
User B signs up with code
  → createOrUpdateUser({ referralCode: "ABC123" })
  → User A: +10 credits, referralCount + 1 ✅
  → User B: 20 credits (10 signup + 10 referral) ✅
```

## Quick Validation

Run this to validate everything:

```bash
# 1. Create test user (manual in dashboard)
# 2. Run refresh
curl -X POST http://localhost:3000/api/cron/refresh-credits

# 3. Check result
curl http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool

# Expected output:
# {
#   "success": true,
#   "eligibleCount": 0,  // Now 0 because user was just refreshed
#   "eligibleUsers": []
# }
```

## Production Deployment

1. **Deploy to Vercel**

    ```bash
    git push origin main
    ```

2. **Verify Cron is Active**

    - Vercel Dashboard → Your Project → Cron Jobs
    - Should see: `/api/cron/refresh-credits` scheduled for "0 0 \* \* \*"

3. **Monitor First Runs**

    - Check Vercel logs after first cron run
    - Verify credits are being added
    - Check for any errors

4. **Add CRON_SECRET (Optional)**
    ```bash
    # In Vercel Dashboard → Settings → Environment Variables
    CRON_SECRET=your-secret-here
    ```

## Files Created/Modified

✅ `convex/schema.ts` - Simplified schema (users only)
✅ `convex/users.ts` - User management + credit functions
✅ `convex/creditRefresh.ts` - Batch refresh logic
✅ `src/app/api/cron/refresh-credits/route.ts` - Cron endpoint
✅ `vercel.json` - Cron schedule
✅ `CREDIT_SYSTEM.md` - System documentation
✅ `TESTING_GUIDE.md` - Detailed test guide
✅ `test-credit-system.sh` - API test script
✅ `test-convex-direct.sh` - Direct Convex test script

## Success Indicators

When everything works:

✅ New users automatically get 10 credits
✅ Referrals work (both users get 10 credits)
✅ $19 payment = basic plan (20 credits/month)
✅ $39 payment = premium plan (100 credits/month)
✅ Credits refresh automatically every 30 days
✅ API endpoint returns eligible users
✅ POST refresh actually adds credits
✅ Users can't refresh twice in 30 days
✅ All data stored in `users` table only

## Next Steps

1. ✅ Run `npx convex dev`
2. ✅ Run `npm run dev`
3. ✅ Test API endpoints
4. ✅ Create test user in Convex Dashboard
5. ✅ Verify credit refresh works
6. ✅ Deploy to production
7. ✅ Monitor first cron runs

---

**Need help?** Check `TESTING_GUIDE.md` for detailed step-by-step tests.
