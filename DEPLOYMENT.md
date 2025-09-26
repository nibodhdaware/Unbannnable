# Deployment Guide

## Environment Configuration

The application uses environment-specific configuration for Dodo Payments integration.

### Local Development (.env.local)

```env
# Use test endpoints for safe local testing
NEXT_PUBLIC_DODO_TEST_API=https://test.dodopayments.com
DODO_PRODUCT_ID=pdt_kUTnut7Xsvf1JOYvS0EPj  # Test product ID
```

### Production (Vercel Environment Variables)

Set these in your Vercel dashboard:

```env
# Use live endpoints for production
NEXT_PUBLIC_DODO_TEST_API=https://live.dodopayments.com
DODO_PRODUCT_ID=pdt_TDD95dpBG1ErSe50lgIgE  # Production product ID
```

## Credit System

### AI Tool Costs

- AI Post Analyzer: 10 credits
- Rule Checker: 5 credits
- Find Better Subreddits: 5 credits
- Anomaly Detection: 3 credits
- Smart Flair Suggestions: 2 credits

### Pricing

- 100 credits for $9 USD

## Testing

### Local Testing

The application is configured to use test.dodopayments.com for local development, ensuring no accidental live transactions.

### Payment Testing

Use the test product ID for safe testing. All payments will be processed through the test environment.

## Deployment Steps

1. **Vercel Environment Variables**: Set production environment variables in Vercel dashboard
2. **Database**: Ensure Convex is properly configured for production
3. **Domain**: Update NEXT_PUBLIC_RETURN_URL for production domain
4. **Webhooks**: Configure Dodo webhook endpoints for production

## Security Notes

- Test and production environments are completely separate
- Local development uses test endpoints by default
- Production credentials should never be used in local development
