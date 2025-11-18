# Deployment Guide - Reddit Ban Checker

## 🔧 Fixes Implemented

### 1. API 500 Error - FIXED ✅
**Problem**: `/api/analyze` was returning 500 errors
**Solution**: 
- Added comprehensive error handling
- Better input validation (checks for empty/invalid postText)
- Improved logging for debugging
- Clear error messages returned to client

### 2. Subreddit Field - NOW REQUIRED ✅
**Problem**: Subreddit was optional, leading to generic analysis
**Solution**:
- Changed to **required** field with red asterisk (*)
- Implemented searchable dropdown (like main app)
- Integrated Fuse.js for fuzzy search
- Loads 100 popular subreddits automatically
- Dynamic Reddit API search for custom subreddits
- Arrow key navigation support

### 3. Favicon - FIXED ✅
**Problem**: 404 error for favicon.ico
**Solution**: 
- Created `/public` folder
- Copied icon from main app
- Added favicon metadata to layout.tsx

### 4. Mobile Responsive - IMPROVED ✅
- Responsive padding: `p-4 sm:p-6 lg:p-8`
- Dropdown adapts to mobile screens
- Touch-friendly interface
- Improved error messages with styled boxes

## 🚀 Quick Deployment Steps

### 1. Install Dependencies
```bash
cd check-tool
npm install  # Installs fuse.js and other deps
```

### 2. Environment Setup
```bash
cp .env.local.example .env.local
```

Add to `.env.local`:
```env
GOOGLE_GEMINI_API_KEY=your_actual_gemini_api_key_here
NEXT_PUBLIC_MAIN_APP_URL=https://unbannnable.com
```

### 3. Test Locally
```bash
npm run dev  # Runs on port 3001
```

Visit http://localhost:3001 and test:
- Select a subreddit from dropdown
- Enter post content
- Click "Check Ban Risk"
- Should get results without errors

### 4. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. **Important**: Set Root Directory to `check-tool`
4. Add Environment Variables:
   - `GOOGLE_GEMINI_API_KEY` = (your key)
   - `NEXT_PUBLIC_MAIN_APP_URL` = `https://unbannnable.com`
5. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
cd check-tool
vercel --prod
# Follow prompts, set root directory when asked
```

### 5. Configure Subdomain

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter: `check.unbannnable.com`

2. **In Your DNS Provider:**
   - Add CNAME record:
     - Type: `CNAME`
     - Name: `check` (or `check.unbannnable.com`)
     - Value: `cname.vercel-dns.com`
     - TTL: 3600 (or auto)

3. **Wait for DNS Propagation**
   - Usually 5-30 minutes
   - Can take up to 48 hours in rare cases
   - Check status: https://www.whatsmydns.net/#CNAME/check.unbannnable.com

## 🧪 Testing Checklist

After deployment, verify:

- [ ] Homepage loads: `https://check.unbannnable.com`
- [ ] Favicon shows in browser tab
- [ ] Subreddit dropdown loads popular subreddits
- [ ] Searching for subreddit works (e.g., "programming")
- [ ] Selecting subreddit closes dropdown
- [ ] Error shown when submitting without subreddit
- [ ] Error shown when submitting without post content
- [ ] Analysis completes successfully
- [ ] Results display with ban risk percentage
- [ ] "Share on Twitter" button works
- [ ] "Try Unbannnable Free" CTA links to main app
- [ ] Mobile responsive on phone
- [ ] No console errors

## 🐛 Common Issues & Fixes

### Issue: "Analysis failed" error
**Causes:**
- Gemini API key not set in Vercel
- API key invalid or quota exceeded
- Network timeout

**Fix:**
1. Check Vercel environment variables
2. Verify key in Google AI Studio
3. Check Vercel logs: `vercel logs check-unbannnable --prod`

### Issue: Dropdown shows no subreddits
**Causes:**
- Reddit API rate limiting
- CORS issues
- Slow network

**Fix:**
1. Wait 1-2 minutes and refresh
2. Check browser console for errors
3. Try incognito mode
4. Verify Reddit is accessible in your region

### Issue: Subdomain not accessible
**Causes:**
- DNS not propagated yet
- CNAME record incorrect
- Vercel domain not verified

**Fix:**
1. Wait longer (up to 48 hours)
2. Double-check CNAME value: `cname.vercel-dns.com`
3. In Vercel, click "Refresh" on domain
4. Check DNS: `nslookup check.unbannnable.com`

### Issue: Favicon 404
**Causes:**
- Public folder not deployed
- Build cache issue

**Fix:**
1. Verify `/public/favicon.ico` exists locally
2. Redeploy: `vercel --prod --force`
3. Clear browser cache

## 📊 Monitoring After Launch

Track these metrics:
- **Traffic**: Check Vercel Analytics
- **Errors**: Monitor Vercel Logs
- **Conversions**: Track clicks to main app
- **Popular Subreddits**: See what users search
- **Average Ban Risk**: Understand user content

## 🎯 Marketing Launch

After deployment is stable:

1. **Soft Launch** (Day 1-3)
   - Share with friends/family
   - Post in your personal network
   - Test conversion funnel

2. **Reddit Posts** (Week 1)
   - r/SideProject: "I built a free tool to check if you'll get banned on Reddit"
   - r/InternetIsBeautiful: Focus on fun/viral angle
   - Include screenshot + link

3. **Social Media** (Week 1-2)
   - Twitter thread with demo
   - LinkedIn post (B2B angle for content marketers)
   - Relevant Facebook groups

4. **Product Hunt** (Week 2)
   - Schedule for Tuesday/Wednesday 12:01am PST
   - Prepare screenshots, video demo
   - Engage in comments all day

## 🔗 Important Links

- **Main App**: https://unbannnable.com
- **Check Tool**: https://check.unbannnable.com (after deployment)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google AI Studio**: https://aistudio.google.com/app/apikey
- **DNS Check**: https://www.whatsmydns.net

## 💡 Pro Tips

1. **Set up analytics** in Vercel to track traffic
2. **Add UTM parameters** to main app links: `?utm_source=check_tool`
3. **Monitor Gemini API usage** to avoid quota issues
4. **Test on multiple devices** before marketing push
5. **Prepare social proof** (screenshots of good results)
6. **Create demo video** for marketing posts

## 📞 Support

If you encounter issues:
1. Check Vercel logs first
2. Verify environment variables
3. Test locally with same data
4. Check browser console for client errors

---

**Status**: ✅ All fixes implemented and ready for deployment
**Last Updated**: November 18, 2025
