# ⚠️ VERCEL DEPLOYMENT ERRORS - HOW TO FIX

## Current Errors Detected

### ❌ Error 1: Favicon 404
**Error**: `GET https://check.unbannnable.com/favicon.ico [HTTP/2 404]`

**Why**: The favicon file exists but Vercel might not have deployed it correctly.

**Fix**:
1. The file exists at `/check-tool/public/favicon.ico` ✅
2. Clear Vercel build cache and redeploy:
   ```bash
   # In Vercel Dashboard:
   # Deployments → Click "..." → Redeploy → Check "Use existing Build Cache" = OFF
   ```
3. Or force rebuild locally:
   ```bash
   cd check-tool
   rm -rf .next
   npm run build
   git add . && git commit -m "Rebuild" && git push
   ```

---

### ❌ Error 2: Analytics Script Failed
**Error**: `[Vercel Web Analytics] Failed to load script from /_vercel/insights/script.js`

**Why**: Web Analytics is not enabled for the project in Vercel.

**Fix** (OPTIONAL - Analytics is not required for functionality):
1. Go to Vercel Dashboard
2. Select your `check-unbannnable` project
3. Click **"Analytics"** tab
4. Click **"Enable Web Analytics"**
5. Redeploy the project

**OR Remove Analytics** (if you don't need it):
```tsx
// In check-tool/src/app/layout.tsx
// Remove this line:
import { Analytics } from "@vercel/analytics/next";

// And remove this from JSX:
<Analytics />
```

---

### ❌ Error 3: API 500 - Analysis Failed (CRITICAL)
**Error**: `POST https://check.unbannnable.com/api/analyze [HTTP/2 500]`

**Why**: `GOOGLE_GEMINI_API_KEY` environment variable is **NOT SET** in Vercel.

**Fix** (REQUIRED):

#### Step 1: Get Your Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Copy your API key (or create new one)

#### Step 2: Add to Vercel
1. Go to Vercel Dashboard
2. Select your project: **check-unbannnable** (or whatever you named it)
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar
5. Click **"Add Variable"**
6. Add:
   - **Name**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: `AIza...your_actual_key_here`
   - **Environment**: Check ✅ **Production**, **Preview**, **Development**
7. Click **"Save"**

#### Step 3: Redeploy
1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes for deployment to complete

#### Step 4: Test
1. Visit https://check.unbannnable.com
2. Select a subreddit (e.g., "programming")
3. Enter post text: "I built a cool app"
4. Click "Check Ban Risk"
5. Should see results WITHOUT 500 error ✅

---

## Quick Fix Checklist

Run through this list in order:

### 1. Environment Variables (CRITICAL)
- [ ] Go to Vercel → Project → Settings → Environment Variables
- [ ] Add `GOOGLE_GEMINI_API_KEY` with your actual key
- [ ] Add `NEXT_PUBLIC_MAIN_APP_URL` = `https://unbannnable.com`
- [ ] Click "Save" on each

### 2. Redeploy
- [ ] Go to Deployments tab
- [ ] Click "..." → "Redeploy"
- [ ] Wait for green checkmark

### 3. Test
- [ ] Visit https://check.unbannnable.com
- [ ] Open browser DevTools (F12) → Console tab
- [ ] Select a subreddit from dropdown
- [ ] Enter test post content
- [ ] Click "Check Ban Risk"
- [ ] Verify no 500 errors in Console
- [ ] Verify results appear

### 4. Optional: Enable Analytics
- [ ] Go to Analytics tab in Vercel
- [ ] Click "Enable Web Analytics"
- [ ] Redeploy

### 5. Optional: Fix Favicon Cache
- [ ] Go to Deployments → Redeploy without cache
- [ ] Or wait 24h for CDN cache to clear

---

## How to Verify Environment Variables Are Set

### Method 1: Vercel Dashboard
1. Project → Settings → Environment Variables
2. You should see `GOOGLE_GEMINI_API_KEY` listed
3. Value should be hidden (••••••••)

### Method 2: Check Deployment Logs
1. Deployments → Click on latest deployment
2. Click "View Function Logs"
3. Trigger the API by testing the tool
4. Look for log: "GOOGLE_GEMINI_API_KEY not configured" ❌
5. If you see this, the env var is NOT set

### Method 3: Test the API Directly
```bash
curl -X POST https://check.unbannnable.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"postText":"test","subreddit":"test"}'
```

Expected response if working:
```json
{
  "banRisk": 45,
  "risk_level": "medium",
  "issues": ["..."],
  "suggestions": ["..."]
}
```

If API key missing:
```json
{
  "error": "API key not configured",
  "details": "Please add GOOGLE_GEMINI_API_KEY...",
  "hint": "Go to Vercel Dashboard → ..."
}
```

---

## Still Not Working?

### Check Vercel Function Logs
1. Vercel Dashboard → Project → Deployments
2. Click on latest deployment
3. Scroll down to "Function Logs"
4. Click "View Function Logs"
5. Test the tool to trigger API call
6. Look for error messages

### Common Issues:

**"API key not configured"**
→ Environment variable not set or typo in variable name

**"429 Rate Limited"**
→ Gemini API quota exceeded, wait or upgrade plan

**"Invalid API key"**
→ Check your API key at https://aistudio.google.com/app/apikey

**"Network error"**
→ Check Vercel function region matches Gemini API availability

---

## Expected Final State

When everything is working:

✅ **Homepage**: https://check.unbannnable.com loads
✅ **Favicon**: Shows in browser tab (may take 24h for CDN cache)
✅ **Subreddit Dropdown**: Shows 100 popular subreddits
✅ **Analysis**: Returns ban risk percentage without errors
✅ **No Console Errors**: DevTools console is clean (except optional analytics warning)
✅ **Mobile**: Works on phone/tablet

---

## Need More Help?

1. Check Vercel documentation: https://vercel.com/docs/environment-variables
2. Check Gemini API docs: https://ai.google.dev/docs
3. Review deployment logs in Vercel dashboard
4. Test locally first: `cd check-tool && npm run dev`

---

**Last Updated**: November 18, 2025
**Status**: Fix guide ready for deployment
