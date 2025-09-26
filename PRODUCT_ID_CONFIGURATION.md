# Dodo Payments Product ID Configuration

## 🎯 Overview

Simple single environment variable configuration for Dodo Payments product IDs across different environments.

## 📋 Configuration

### **Single Environment Variable**

```bash
DODO_PRODUCT_ID=your_product_id_here
```

### **Local Development (.env.local)**

```bash
# Your test product ID for local development
DODO_PRODUCT_ID=pdt_kUTnut7Xsvf1JOYvS0EPj
```

### **Production (Vercel Environment Variables)**

```bash
# Your live product ID - set in Vercel dashboard
DODO_PRODUCT_ID=pdt_TDD95dpBG1ErSe50lgIgE
```

## 🔄 How It Works

### **API Implementation**

```typescript
// Simple environment variable lookup
const productId = process.env.DODO_PRODUCT_ID;

if (!productId) {
    console.error("DODO_PRODUCT_ID not configured");
    return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 },
    );
}
```

### **Environment-Specific Values**

- **Local**: `pdt_kUTnut7Xsvf1JOYvS0EPj` (test product)
- **Vercel Production**: `pdt_TDD95dpBG1ErSe50lgIgE` (live product)

## ✅ Benefits

### **Simplicity**

- ✅ Single environment variable to manage
- ✅ No complex environment detection logic
- ✅ Clean and straightforward configuration

### **Vercel Integration**

- ✅ Easy to set in Vercel environment variables
- ✅ Different values per environment automatically
- ✅ No code changes needed between environments

### **Error Prevention**

- ✅ Clear validation and error messages
- ✅ Logs which product ID is being used
- ✅ Fails gracefully if not configured

## 🚀 Deployment Setup

### **Local Development**

1. Already configured in `.env.local`
2. Uses test product ID: `pdt_kUTnut7Xsvf1JOYvS0EPj`

### **Vercel Production**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `DODO_PRODUCT_ID` = `pdt_TDD95dpBG1ErSe50lgIgE`
3. Deploy - production will use the live product ID

## 📊 Logging

The API logs the product ID being used:

```
Using product ID: pdt_kUTnut7Xsvf1JOYvS0EPj
Creating payment with product ID: pdt_kUTnut7Xsvf1JOYvS0EPj
```

## 🎉 Status: COMPLETE ✅

Your payment system now uses:

- ✅ Single `DODO_PRODUCT_ID` environment variable
- ✅ Test product ID for local development
- ✅ Production product ID set in Vercel
- ✅ Clean, simple configuration
- ✅ Ready for deployment
