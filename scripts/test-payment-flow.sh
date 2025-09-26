#!/bin/bash

echo "🧪 Testing Payment Success Flow"
echo "================================"

# Test URLs
BASE_URL="http://localhost:3002"
SUCCESS_URL="$BASE_URL/success?payment_id=test_payment_123&amount=9.00"
CANCEL_URL="$BASE_URL/cancel?payment_id=test_payment_123"

echo "Testing Success Page:"
echo "URL: $SUCCESS_URL"
echo ""

echo "Testing Cancel Page:"
echo "URL: $CANCEL_URL"
echo ""

echo "✅ Test URLs generated!"
echo ""
echo "To test manually:"
echo "1. Start your development server: npm run dev"
echo "2. Open these URLs in your browser:"
echo "   - Success: $SUCCESS_URL"
echo "   - Cancel: $CANCEL_URL"
echo ""
echo "Expected behavior:"
echo "- Success page should add 100 credits to your account"
echo "- Both pages should have 'Go to Dashboard' buttons"
echo "- Cancel page should show payment cancelled message"