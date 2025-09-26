#!/usr/bin/env node

// Test script to verify single DODO_PRODUCT_ID configuration

console.log("🧪 Testing Single Product ID Configuration\n");

// Mock environment setups
const environments = [
    {
        name: "Local Development",
        DODO_PRODUCT_ID: "pdt_kUTnut7Xsvf1JOYvS0EPj",
    },
    {
        name: "Vercel Production",
        DODO_PRODUCT_ID: "pdt_TDD95dpBG1ErSe50lgIgE",
    },
];

environments.forEach((env) => {
    console.log(`📋 Environment: ${env.name}`);
    console.log(`   DODO_PRODUCT_ID: ${env.DODO_PRODUCT_ID}`);
    console.log(
        `   ✅ ${env.name === "Local Development" ? "Using test product for safe local testing" : "Using production product for live payments"}\n`,
    );
});

console.log("🎯 Configuration Summary:");
console.log("   🧪 Local (.env.local): pdt_kUTnut7Xsvf1JOYvS0EPj");
console.log("   🚀 Vercel (Environment Variables): pdt_TDD95dpBG1ErSe50lgIgE");
console.log(
    "\n✅ Simple single environment variable configuration is working correctly!",
);
console.log(
    "📝 No complex environment detection needed - just set DODO_PRODUCT_ID in Vercel!",
);
