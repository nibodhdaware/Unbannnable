# 🚨 PRODUCTION ISSUE - API 500 ERROR

## Current Problem

Your check-tool is deployed but the analysis fails with:

```
POST https://check.unbannnable.com/api/analyze [HTTP/2 500]
Analysis error: Error: Failed to analyze post
```

## Root Cause

**The `GOOGLE_GEMINI_API_KEY` environment variable is NOT set in Vercel.**

## How to Verify

Visit this URL to check:

```
https://check.unbannnable.com/api/health
```

**Expected if working:**

```json
{
    "status": "ok",
    "apiKeyConfigured": true,
    "message": "✅ API key is configured correctly"
}
```

**Current (broken):**

```json
{
    "status": "ok",
    "apiKeyConfigured": false,
    "message": "❌ GOOGLE_GEMINI_API_KEY environment variable is missing..."
}
```

## Fix Steps (5 minutes)

### Step 1: Get Your API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key" or copy existing key
3. Copy the key (starts with `AIza...`)

### Step 2: Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Find your project (probably named "check-tool" or "check-unbannnable")
3. Click on the project
4. Click **"Settings"** (top menu)
5. Click **"Environment Variables"** (left sidebar)
6. Click **"Add Variable"** button

### Step 3: Configure Variable

Fill in the form:

- **Key**: `GOOGLE_GEMINI_API_KEY`
- **Value**: Paste your API key (e.g., `AIzaSyC...`)
- **Environments**: Check ALL three boxes:
    - ✅ Production
    - ✅ Preview
    - ✅ Development
- Click **"Save"**

### Step 4: Redeploy

1. Click **"Deployments"** (top menu)
2. Find the latest deployment (top of list)
3. Click the **"..."** button (three dots)
4. Click **"Redeploy"**
5. Wait 1-2 minutes for deployment to complete
6. Look for green checkmark ✅

### Step 5: Test

1. Visit: https://check.unbannnable.com/api/health
2. Verify: `"apiKeyConfigured": true`
3. Visit: https://check.unbannnable.com
4. Select subreddit: "programming"
5. Enter text: "I built a cool app"
6. Click "Check Ban Risk"
7. Should work! ✅

## What Changed

I just pushed these fixes:

1. **✅ Removed Analytics** - No more script loading warnings
2. **✅ Better error messages** - Shows exactly what's wrong
3. **✅ Health check endpoint** - Visit `/api/health` to diagnose issues
4. **✅ Favicon** - Already in public folder, will work after Vercel redeploys

## After Setting the Environment Variable

Everything will work:

- ✅ No more 500 errors
- ✅ Analysis returns results
- ✅ No console warnings (except favicon cache might take time)
- ✅ Production-ready

## Screenshot Guide

**Where to add the environment variable:**

```
Vercel Dashboard
  → Your Project (check-tool)
    → Settings (top menu)
      → Environment Variables (left sidebar)
        → Add Variable button
          → Key: GOOGLE_GEMINI_API_KEY
          → Value: AIzaSy... (your key)
          → Environments: ✅ All three
          → Save
```

## Common Mistakes

❌ **Wrong variable name** - Must be exactly: `GOOGLE_GEMINI_API_KEY`
❌ **Forgot to redeploy** - Must redeploy after adding env vars
❌ **Only checked Production** - Check all three environments
❌ **Wrong project** - Make sure you're in the check-tool project

## Still Not Working?

1. Check the health endpoint: `/api/health`
2. Check Vercel Function Logs:
    - Deployments → Click deployment → View Function Logs
3. Verify the env var name is spelled correctly
4. Try removing and re-adding the variable
5. Make sure you redeployed after adding it

---

**Status**: Waiting for you to add `GOOGLE_GEMINI_API_KEY` in Vercel
**ETA**: 5 minutes to fix
**Priority**: CRITICAL - Site won't work without this
