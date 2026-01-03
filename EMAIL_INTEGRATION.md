# Resend Email Integration - Unbannnable

Complete email automation system with AI personalization for user lifecycle emails.

## Overview

This integration provides:

- 5 automated email templates for user lifecycle
- AI-powered personalization using Claude
- Email tracking (opens, clicks)
- User preference management
- Admin dashboard for monitoring

## Quick Start

### 1. Install Dependencies

```bash
npm install resend @anthropic-ai/sdk react-email @react-email/components
```

### 2. Set Environment Variables

Add these to your `.env.local`:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL="Unbannnable <noreply@unbannnable.com>"
RESEND_REPLY_TO=support@unbannnable.com

# Anthropic (for AI personalization)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Email Settings
EMAIL_TEST_MODE=false
EMAIL_TEST_RECIPIENT=your-test-email@example.com

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://unbannnable.com

# Cron secret (for API authentication)
CRON_SECRET=your-secure-random-string
```

### 3. Deploy Schema Changes

```bash
npx convex deploy
```

### 4. Test Emails

```bash
npx tsx scripts/test-emails.ts
```

## Email Templates

### Template A: Welcome Email (Day 0)

- **Trigger**: User signs up
- **Subject**: "Welcome to Unbannnable - Your Reddit Safety Net 🛡️"
- **Content**: Personal greeting, feature explanation, credit balance, CTA

### Template B: First Use Nudge (Day 2)

- **Trigger**: 48 hours after signup, no usage
- **Subject**: "Quick question about Unbannnable... 🤔"
- **Content**: Friendly check-in, FAQ, help offer

### Template C: Value Reinforcement (Day 5)

- **Trigger**: User has checked 5+ posts
- **Subject**: "You're crushing it on Reddit 🎯"
- **Content**: Usage stats, potential bans avoided, pro tips

### Template D: Upgrade Prompt (Day 7)

- **Trigger**: Free tier, used >50% credits
- **Subject**: "Running low on credits? Here's what's next... 📉"
- **Content**: Upgrade options, feature highlights

### Template E: Re-engagement (Day 14)

- **Trigger**: Inactive for 7+ days
- **Subject**: "We miss you - here's 10 free credits 🎁"
- **Content**: Bonus credits, new features, feedback request

## Architecture

```
src/lib/email/
├── index.ts          # Main service, email orchestration
├── resend.ts         # Resend SDK wrapper, tracking
├── templates.ts      # HTML email templates
└── personalization.ts # Claude AI integration

convex/
├── emails.ts         # Database queries & mutations
├── emailActions.ts   # Convex actions for sending
└── schema.ts         # Email tables schema

src/app/
├── api/
│   ├── emails/send/        # Email sending endpoint
│   ├── email-preferences/  # Preference management
│   │   ├── route.ts        # GET/POST preferences
│   │   ├── unsubscribe/    # Unsubscribe handler
│   │   ├── track/          # Open tracking pixel
│   │   └── click/          # Click tracking
│   └── cron/
│       └── email-triggers/ # Daily trigger cron
├── email-preferences/      # User preferences page
└── app/admin/emails/       # Admin dashboard
```

## Database Schema

### emailEvents Table

```typescript
{
  userId: Id<"users">,
  emailType: string,       // "welcome", "first_use_nudge", etc.
  status: string,          // "sent", "failed"
  sentAt: number,          // Timestamp
  openedAt?: number,       // When opened (via pixel)
  clickedAt?: number,      // When clicked (via redirect)
  metadata?: any,          // Extra data (errors, etc.)
}
```

### emailContentCache Table

```typescript
{
  userId: Id<"users">,
  emailType: string,
  personalizedContent: string,  // AI-generated content
  generatedAt: number,
  expiresAt: number,            // 24h cache
}
```

### User Fields (added)

```typescript
{
  emailPreferences?: {
    allEmails: boolean,
    marketingEmails: boolean,
    criticalUpdates: boolean,
  },
  lastEmailSentAt?: number,
  unsubscribedAt?: number,
}
```

## AI Personalization

Uses Claude claude-sonnet-4-20250514 to generate personalized email snippets based on:

- User's usage pattern (power user vs casual)
- Most-used subreddits
- Time of day they're most active
- Days since signup

### Example Personalization

Input:

```json
{
    "totalPostsChecked": 15,
    "topSubreddits": ["technology", "programming"],
    "peakHour": 20,
    "isPowerUser": true
}
```

Output:

> "We noticed you're active in r/technology and r/programming – those communities have some of the strictest rules! Your evening posting habit is perfect for catching the after-work crowd."

### Caching

- Personalized content is cached for 24 hours
- Falls back to static template if API fails
- Reduces API costs for repeat sends

## Trigger System

### Cron Job

Runs daily at 9:00 AM UTC via Vercel Cron:

```json
{
    "crons": [
        {
            "path": "/api/cron/email-triggers",
            "schedule": "0 9 * * *"
        }
    ]
}
```

### Rate Limiting

- Max 1 email per user per day
- Skip unsubscribed users
- 300ms delay between emails to avoid Resend limits

### Trigger Logic

```typescript
// Welcome: New users in last 24h, no welcome sent
getUsersForWelcomeEmail();

// First Use Nudge: Signed up 2-3 days ago, 0 posts
getUsersForFirstUseNudge();

// Value Reinforcement: Created 5-6 days ago, 5+ posts
getUsersForValueReinforcement();

// Upgrade Prompt: Created 7-8 days ago, >50% credits used, no plan
getUsersForUpgradePrompt();

// Re-engagement: Created 14-21 days ago, inactive 7+ days
getUsersForReEngagement();
```

## API Endpoints

### Send Email

```
POST /api/emails/send
Authorization: Bearer {CRON_SECRET}
{
  "emailType": "welcome",
  "userId": "xxx",
  "userData": { ... }
}
```

### Get Preferences

```
GET /api/email-preferences
// Requires authentication
```

### Update Preferences

```
POST /api/email-preferences
{
  "preferences": {
    "allEmails": true,
    "marketingEmails": false,
    "criticalUpdates": true
  }
}
```

### Unsubscribe

```
GET /api/email-preferences/unsubscribe?token={base64_email}
// Redirects to preferences page
```

### Track Open

```
GET /api/email-preferences/track?u={userId}&t={emailType}
// Returns 1x1 transparent pixel
```

### Track Click

```
GET /api/email-preferences/click?u={userId}&t={emailType}&r={redirectUrl}
// Logs click, redirects to URL
```

## Admin Dashboard

Access at `/app/admin/emails` (admin only)

Features:

- Total emails sent/failed
- Open rate and click rate
- Breakdown by email type
- Manual trigger button
- Test email buttons

## Testing

### Run Test Suite

```bash
npx tsx scripts/test-emails.ts
```

### Test Mode

Set `EMAIL_TEST_MODE=true` to send all emails to `EMAIL_TEST_RECIPIENT` instead of real users.

### Manual Test

Use the admin dashboard test buttons or call:

```bash
curl -X POST http://localhost:3000/api/emails/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "emailType": "welcome",
    "userId": "test-id",
    "userData": { "fullName": "Test User", "currentCredits": 10 },
    "testMode": true
  }'
```

## Email Client Compatibility

Templates use:

- Inline CSS (no external stylesheets)
- Table-based layout fallbacks
- Web-safe fonts
- Tested in: Gmail, Outlook, Apple Mail

## Monitoring

### Resend Dashboard

Monitor delivery, bounces, complaints at: https://resend.com/emails

### Convex Dashboard

View email events and stats in Convex dashboard

### PostHog (optional)

Track email conversion events in your analytics

## Troubleshooting

### Emails not sending

1. Check `RESEND_API_KEY` is valid
2. Verify domain is configured in Resend
3. Check Convex function logs

### Personalization failing

1. Check `ANTHROPIC_API_KEY` is valid
2. Review personalization.ts logs
3. System falls back to static content

### Tracking not working

1. Verify `NEXT_PUBLIC_APP_URL` is correct
2. Check tracking endpoints are accessible
3. Some email clients block tracking pixels

### Cron not running

1. Verify vercel.json cron configuration
2. Check Vercel deployment logs
3. Test manually with POST request

## Future Improvements

- [ ] A/B testing for subject lines
- [ ] Email sequence builder UI
- [ ] Webhook integration for real-time events
- [ ] Bounce/complaint handling
- [ ] Email fatigue scoring
- [ ] Multi-language templates
