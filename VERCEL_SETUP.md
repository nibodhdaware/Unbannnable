# Vercel Deployment Setup for Dodo Payments

## 🚀 Environment Variables Setup

### **In Your Vercel Dashboard:**

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

```
DODO_PRODUCT_ID = pdt_TDD95dpBG1ErSe50lgIgE
```

### **Environment Variable Configuration:**

| Variable          | Local Value                 | Vercel Production Value     |
| ----------------- | --------------------------- | --------------------------- |
| `DODO_PRODUCT_ID` | `pdt_kUTnut7Xsvf1JOYvS0EPj` | `pdt_TDD95dpBG1ErSe50lgIgE` |

## ✅ How It Works

- **Local Development**: Uses `.env.local` with test product ID
- **Vercel Production**: Uses environment variable with live product ID
- **Same Code**: No changes needed between environments

## 🎯 Deployment Checklist

- [x] Local `.env.local` has test product ID
- [ ] Vercel environment variable set with production product ID
- [ ] Deploy to Vercel
- [ ] Test payment flow in production

## 📝 Notes

- The API will automatically use whatever `DODO_PRODUCT_ID` is set to
- Local testing uses test product (safe)
- Production uses live product (real payments)
- Simple and clean configuration!
