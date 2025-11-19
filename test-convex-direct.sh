#!/bin/bash

echo "============================================"
echo "Convex Credit System Direct Test"
echo "============================================"
echo ""
echo "This script tests the credit system by directly"
echo "calling Convex functions (no API needed)"
echo ""

CONVEX_URL="${NEXT_PUBLIC_CONVEX_URL}"

if [ -z "$CONVEX_URL" ]; then
    echo "❌ NEXT_PUBLIC_CONVEX_URL not set in environment"
    echo "Please run: source .env.local"
    exit 1
fi

echo "✅ Using Convex URL: $CONVEX_URL"
echo ""

# Check if Convex CLI is available
if ! command -v convex &> /dev/null; then
    echo "⚠️  Convex CLI not found. Installing..."
    npm install -g convex
fi

echo "============================================"
echo "Test 1: List all users"
echo "============================================"
npx convex run users:getUserByEmail '{"email":"test@example.com"}'
echo ""

echo "============================================"
echo "Test 2: Create test user with signup bonus"
echo "============================================"
npx convex run users:createOrUpdateUser '{
  "clerkId": "test_'$(date +%s)'",
  "email": "test-'$(date +%s)'@example.com",
  "fullName": "Test User"
}'
echo ""

echo "============================================"
echo "Test 3: Check eligible users for refresh"
echo "============================================"
npx convex run creditRefresh:getEligibleUsersForRefresh '{}'
echo ""

echo "============================================"
echo "Tests Complete!"
echo "============================================"
echo ""
echo "To see all data, visit: https://dashboard.convex.dev"
echo ""
