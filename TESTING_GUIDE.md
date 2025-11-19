# Credit System Testing Guide

## Prerequisites

1. **Start Convex Dev Server:**

```bash
cd /Users/nibodhdaware/Developer/unbannnable
npx convex dev
```

_Leave this running in one terminal_

2. **Start Next.js Dev Server:**

```bash
cd /Users/nibodhdaware/Developer/unbannnable
npm run dev
```

_Leave this running in another terminal_

## Test 1: Check Eligible Users for Credit Refresh

**What it tests:** Finds all users with lifetime plans who are ready for credit refresh

```bash
curl -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
```

**Expected Response:**

```json
{
    "success": true,
    "eligibleCount": 0,
    "eligibleUsers": [],
    "message": "Use POST method to actually refresh credits..."
}
```

**What to check:**

- ✅ `success: true`
- ✅ Shows count of eligible users
- ✅ Lists users with `lifetimePlan`, `daysSinceRefresh`, etc.

---

## Test 2: Create Test User in Convex Dashboard

**Manual Step:**

1. Go to Convex Dashboard: https://dashboard.convex.dev
2. Open your project
3. Go to "Data" tab
4. Click "users" table
5. Click "Add Document"
6. Add this JSON:

```json
{
    "clerkId": "test_user_123",
    "email": "test@example.com",
    "fullName": "Test User",
    "totalPurchasedPosts": 50,
    "lifetimePlan": "premium",
    "lifetimePlanPurchaseDate": 1700000000000,
    "lastMonthlyRefreshDate": 1700000000000,
    "referralCode": "TEST1234",
    "referralCount": 0,
    "hasReceivedSignupBonus": true,
    "createdAt": 1700000000000,
    "updatedAt": 1700000000000
}
```

**This creates a user who:**

- Has premium plan ($39 one-time)
- Purchased 30+ days ago (will be eligible for refresh)
- Currently has 50 credits

---

## Test 3: Check Eligible Users Again

```bash
curl -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
```

**Expected Response:**

```json
{
  "success": true,
  "eligibleCount": 1,
  "eligibleUsers": [
    {
      "userId": "...",
      "clerkId": "test_user_123",
      "email": "test@example.com",
      "lifetimePlan": "premium",
      "daysSinceRefresh": 30+
    }
  ]
}
```

**What to check:**

- ✅ `eligibleCount: 1`
- ✅ Shows test user
- ✅ `daysSinceRefresh` is 30 or more

---

## Test 4: Refresh Credits (POST Request)

**What it tests:** Actually adds credits to eligible users

```bash
curl -X POST -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
```

**Expected Response:**

```json
{
    "success": true,
    "message": "Credit refresh completed",
    "results": {
        "total": 1,
        "refreshed": 1,
        "skipped": 0,
        "errors": []
    },
    "timestamp": "2025-11-19T..."
}
```

**What to check:**

- ✅ `success: true`
- ✅ `refreshed: 1` (our test user got credits)
- ✅ `errors: []` (no errors)

---

## Test 5: Verify Credits Added in Database

1. Go back to Convex Dashboard
2. Open "users" table
3. Find test user (`test_user_123`)
4. Check fields:

**Before refresh:** `totalPurchasedPosts: 50`
**After refresh:** `totalPurchasedPosts: 150` (50 + 100 for premium)

**Also check:**

- ✅ `lastMonthlyRefreshDate` updated to current timestamp
- ✅ `lifetimePlan` still "premium"

---

## Test 6: Try Refreshing Again (Should Fail)

```bash
curl -X POST -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
```

**Expected Response:**

```json
{
    "success": true,
    "results": {
        "total": 1,
        "refreshed": 0,
        "skipped": 1,
        "errors": []
    }
}
```

**What to check:**

- ✅ `refreshed: 0` (user already refreshed today)
- ✅ `skipped: 1` (user skipped because < 30 days)

---

## Test 7: Test Signup Bonus (Via Convex Dashboard Functions)

**Manual Test in Dashboard:**

1. Go to Convex Dashboard → Functions
2. Find `users:createOrUpdateUser`
3. Click "Run" and provide args:

```json
{
    "clerkId": "new_user_456",
    "email": "newuser@example.com",
    "fullName": "New User"
}
```

4. Click "Run Function"
5. Go to "Data" → "users" table
6. Find the new user
7. **Check:** `totalPurchasedPosts: 10` ✅ (signup bonus!)

---

## Test 8: Test Referral System

**Step 1: Get referral code from first user**

```json
// In Convex Dashboard, first user has:
"referralCode": "TEST1234"
```

**Step 2: Create second user with referral**
Go to Functions → `users:createOrUpdateUser`:

```json
{
    "clerkId": "referred_user_789",
    "email": "referred@example.com",
    "fullName": "Referred User",
    "referralCode": "TEST1234"
}
```

**Step 3: Verify both users**

**Referrer (test_user_123):**

- ✅ `totalPurchasedPosts` increased by 10
- ✅ `referralCount: 1`

**Referee (referred_user_789):**

- ✅ `totalPurchasedPosts: 20` (10 signup + 10 referral)
- ✅ `referredBy: "TEST1234"`

---

## Test 9: Test Lifetime Plan Purchase

**In Convex Dashboard Functions:**

1. Find `users:purchaseLifetimePlan`
2. Run with args:

```json
{
    "clerkId": "test_user_123",
    "amount": 1900
}
```

**Expected Result:**

```json
{
    "success": true,
    "plan": "basic",
    "creditsAdded": 20,
    "message": "Lifetime basic plan activated! You'll receive 20 credits every month."
}
```

**Verify in Database:**

- ✅ `lifetimePlan: "basic"`
- ✅ `totalPurchasedPosts` increased by 20
- ✅ `lifetimePlanPurchaseDate` set to current time
- ✅ `lastMonthlyRefreshDate` set to current time

---

## Test 10: Check User's Plan Info

**In Convex Dashboard Functions:**

1. Find `users:getLifetimePlanInfo`
2. Run with args:

```json
{
    "clerkId": "test_user_123"
}
```

**Expected Result:**

```json
{
    "hasLifetimePlan": true,
    "plan": "basic",
    "monthlyCredits": 20,
    "purchaseDate": 1700000000000,
    "lastRefreshDate": 1700000000000,
    "daysUntilNextRefresh": 30,
    "canRefreshNow": false
}
```

---

## Complete End-to-End Test Script

Save this as `test-complete-system.sh`:

```bash
#!/bin/bash

echo "🧪 Complete Credit System Test"
echo "================================"
echo ""

# Test 1: Check Eligible Users
echo "1️⃣  Checking eligible users..."
curl -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
echo ""

# Test 2: Refresh Credits
echo "2️⃣  Refreshing credits (POST)..."
curl -X POST -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
echo ""

# Test 3: Try Again (Should Skip)
echo "3️⃣  Trying to refresh again (should skip)..."
curl -X POST -s http://localhost:3000/api/cron/refresh-credits | python3 -m json.tool
echo ""

echo "✅ API Tests Complete!"
echo ""
echo "Next: Check Convex Dashboard to verify database changes"
```

---

## Expected Database State After All Tests

**users table should have:**

- User with 10 credits (signup bonus only)
- User with 20 credits (signup + referral)
- User with lifetime plan and refreshed credits
- All users with `referralCode` generated

**posts table:**

- (No changes - posts are created separately)

---

## Troubleshooting

**Error: "Cannot find module convex/\_generated/api"**

- Solution: Run `npx convex dev` in the project directory

**Error: "Could not find public function"**

- Solution: Wait for Convex to finish deploying functions
- Check Convex Dashboard → Logs for any schema errors

**Error: Connection refused**

- Solution: Make sure Next.js dev server is running
- Check `npm run dev` is active

**No eligible users found:**

- Solution: Create test user with old `lastMonthlyRefreshDate`
- Set date to 30+ days ago: `Date.now() - (31 * 24 * 60 * 60 * 1000)`

---

## Success Criteria

✅ All API endpoints return `success: true`
✅ Eligible users are detected correctly
✅ Credits are added to users with lifetime plans
✅ Users can't refresh twice within 30 days
✅ New users get 10 credit signup bonus
✅ Referrals give 10 credits to both users
✅ Lifetime plan purchase works for $19 and $39
✅ Database updates correctly tracked

---

## Production Checklist

Before deploying to production:

1. ✅ Add `CRON_SECRET` to environment variables
2. ✅ Update cron endpoint to require authorization
3. ✅ Remove GET method from cron endpoint (security)
4. ✅ Set up Vercel Cron job (already in vercel.json)
5. ✅ Test with real payment webhook
6. ✅ Monitor first few credit refreshes
7. ✅ Set up alerting for failed refreshes
