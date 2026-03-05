# Unbannnable Chrome Extension

Inline Chrome extension UI for Reddit post creation pages.

## What it does

- Injects an Unbannnable sidebar card directly on Reddit create-post pages
- Prefers placement above the subreddit `RULES` panel (fallback to floating card)
- Captures current draft subreddit/title/body
- Shows Clerk login state + credits + usage
- Runs viability analysis with `/api/reddit/check-post-viability`
- Opens in-depth analysis in a new `unbannnable.com/app` tab with auto-analysis params

## Load locally

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `unbannnable-chrome`

## Optional config

- Storage key `appBaseUrl` can override backend URL (default: `https://unbannnable.com`).
