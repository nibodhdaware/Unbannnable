# 🚀 Quick Deployment Reference

## ✅ All Issues Fixed

1. **API 500 Error** → Better error handling + logging
2. **Subreddit Optional** → Now REQUIRED with searchable dropdown
3. **Favicon 404** → Created and configured
4. **Mobile UX** → Fully responsive

## 📋 Deploy Now (5 Steps)

### 1. Environment

```bash
cd check-tool
cp .env.local.example .env.local
# Add: GOOGLE_GEMINI_API_KEY=your_key
```

### 2. Test Locally

```bash
npm install
npm run dev  # http://localhost:3001
```

### 3. Deploy to Vercel

```bash
vercel --prod
# OR use Vercel Dashboard
# Set root directory: check-tool
```

### 4. Add Env Vars in Vercel

- `GOOGLE_GEMINI_API_KEY` = (your key)
- `NEXT_PUBLIC_MAIN_APP_URL` = `https://unbannnable.com`

### 5. Configure Subdomain

**DNS (your domain provider):**

- Type: CNAME
- Name: `check`
- Value: `cname.vercel-dns.com`

**Vercel Dashboard:**

- Settings → Domains → Add `check.unbannnable.com`

## ✅ Verification Checklist

After deployment, test:

- [ ] Site loads: https://check.unbannnable.com
- [ ] Favicon appears
- [ ] Subreddit dropdown shows options
- [ ] Search for "programming" works
- [ ] Form requires both fields
- [ ] Analysis returns results
- [ ] Mobile view looks good
- [ ] No console errors

## 🐛 Quick Troubleshooting

| Issue          | Fix                      |
| -------------- | ------------------------ |
| API 500        | Check env var in Vercel  |
| Empty dropdown | Wait 30s, refresh page   |
| Subdomain 404  | Wait for DNS (up to 48h) |
| Favicon 404    | Redeploy with `--force`  |

## 📞 Need Help?

Check these files:

- `DEPLOYMENT.md` - Detailed guide
- `FIXES.md` - What was changed
- Vercel logs - For runtime errors

---

**Build Status**: ✅ Successful (47.7 kB)
**Ready**: YES
