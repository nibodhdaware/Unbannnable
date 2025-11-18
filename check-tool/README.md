# Reddit Ban Checker - Free Tool

A viral free tool to drive traffic to the main Unbannnable app. Users can check if their Reddit post will get banned before posting.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Add your Gemini API key to .env.local
GOOGLE_GEMINI_API_KEY=your_key_here

# Run development server (port 3001)
npm run dev
```

Visit: http://localhost:3001

## 📦 Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Google Gemini AI** - Post analysis
- **Lucide React** - Icons

## 🎯 Features

- ✅ Instant ban risk analysis
- ✅ AI-powered rule checking
- ✅ Subreddit-specific analysis
- ✅ Social sharing (Twitter)
- ✅ Mobile responsive
- ✅ Zero authentication required
- ✅ SEO optimized

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_MAIN_APP_URL=https://unbannnable.com
```

### Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set custom domain (subdomain)
# Go to Vercel Dashboard → Settings → Domains
# Add: check.unbannnable.com
```

#### Environment Variables on Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

- `GOOGLE_GEMINI_API_KEY`
- `NEXT_PUBLIC_MAIN_APP_URL`

## 📊 Analytics Integration

To track conversions, add to `src/app/layout.tsx`:

```typescript
// Google Analytics
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js`:

```js
colors: {
  reddit: '#FF4500', // Change brand color
}
```

### Main App URL

Update in `.env.local`:

```
NEXT_PUBLIC_MAIN_APP_URL=https://your-domain.com
```

## 🚀 Marketing Strategy

### Launch Checklist

- [ ] Deploy to `check.unbannnable.com`
- [ ] Submit to ProductHunt
- [ ] Post on r/SideProject, r/InternetIsBeautiful
- [ ] Share on Twitter with example results
- [ ] Create blog post: "I analyzed 1000 Reddit posts"
- [ ] Add to bio links
- [ ] Create shareable result images

### Viral Mechanics

1. **Shocking Results** - "92% ban risk" gets shares
2. **Social Proof** - Share button with pre-filled text
3. **Before/After** - Show improvement with main app
4. **Leaderboard** (future) - Worst ban scores

## 📈 Conversion Optimization

Current conversion funnel:

1. User checks post (free)
2. Sees high ban risk
3. Clicks "Try Unbannnable Free"
4. Signs up for main app
5. Converts to paid (LTD offer)

### A/B Test Ideas

- Different CTA copy
- Result page layout
- Upsell card timing
- Color schemes

## 🔗 Integration with Main App

The tool links to main app at:

- Header logo
- Footer
- Upsell card (2 CTAs)

Track conversions by adding UTM parameters:

```
?utm_source=ban-checker&utm_medium=free-tool&utm_campaign=upsell
```

## 🐛 Troubleshooting

### API Key Issues

If you see "API key not configured":

1. Check `.env.local` exists
2. Verify `GOOGLE_GEMINI_API_KEY` is set
3. Restart dev server

### Port Conflicts

Tool runs on port 3001 by default. To change:

```bash
npm run dev -- -p 3002
```

## 📝 License

Part of the Unbannnable monorepo. Same license as main app.

## 🤝 Contributing

This is a standalone free tool. Keep it:

- Simple (one page)
- Fast (<3s analysis)
- No authentication
- Mobile-friendly

---

Built with ❤️ to drive traffic to [Unbannnable](https://unbannnable.com)
