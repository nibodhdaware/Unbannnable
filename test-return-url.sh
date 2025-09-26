#!/bin/bash

echo "🔄 Testing Updated Payment Flow with return_url"
echo "==============================================="

BASE_URL="http://localhost:3002"

echo ""
echo "📝 Test URLs for different payment outcomes:"
echo ""

# Success scenarios
echo "✅ SUCCESSFUL PAYMENT:"
echo "URL: ${BASE_URL}/success?payment_id=test_success_123&status=completed"
echo "Expected: Adds 100 credits and shows success page"
echo ""

# Cancelled scenarios
echo "❌ CANCELLED PAYMENT (Method 1):"
echo "URL: ${BASE_URL}/success?payment_id=test_cancel_123&cancelled=true"
echo "Expected: Redirects to /cancel page"
echo ""

echo "❌ CANCELLED PAYMENT (Method 2):"
echo "URL: ${BASE_URL}/success?payment_id=test_cancel_456&status=cancelled"
echo "Expected: Redirects to /cancel page"
echo ""

echo "❌ CANCELLED PAYMENT (Method 3):"
echo "URL: ${BASE_URL}/success?payment_id=test_cancel_789&cancel=true"
echo "Expected: Redirects to /cancel page"
echo ""

echo "🔧 API Changes Made:"
echo "- Replaced success_url & cancel_url with single return_url"
echo "- Updated success page to handle both success/cancel scenarios"
echo "- Success page now checks URL parameters for payment status"
echo "- Automatic redirect to /cancel if payment was cancelled"
echo ""

echo "🚀 To Test:"
echo "1. npm run dev"
echo "2. Sign in with Clerk"
echo "3. Try the URLs above"
echo "4. Verify success adds credits, cancel redirects properly"