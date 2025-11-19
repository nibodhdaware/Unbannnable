#!/bin/bash

echo "============================================"
echo "Testing Unbannnable Credit System"
echo "============================================"
echo ""

BASE_URL="http://localhost:3000"

echo "1️⃣  Testing Cron Endpoint (GET - Check eligible users)"
echo "-------------------------------------------"
curl -s "$BASE_URL/api/cron/refresh-credits" | jq . || echo "❌ Endpoint failed or jq not installed"
echo ""
echo ""

echo "2️⃣  Testing Cron Endpoint (POST - Refresh credits)"
echo "-------------------------------------------"
curl -s -X POST "$BASE_URL/api/cron/refresh-credits" | jq . || echo "❌ Endpoint failed"
echo ""
echo ""

echo "============================================"
echo "Tests Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Check Convex dashboard for database changes"
echo "2. Look at server logs above for any errors"
echo "3. Test user signup with referral code"
echo ""
