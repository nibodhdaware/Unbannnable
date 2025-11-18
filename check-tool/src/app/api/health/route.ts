import { NextResponse } from "next/server";

export async function GET() {
    // Simple health check endpoint
    const hasApiKey = !!process.env.GOOGLE_GEMINI_API_KEY;
    const apiKeyLength = process.env.GOOGLE_GEMINI_API_KEY?.length || 0;

    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        apiKeyConfigured: hasApiKey,
        apiKeyLength:
            apiKeyLength > 0 ? `${apiKeyLength} characters` : "0 (NOT SET)",
        message: hasApiKey
            ? "✅ API key is configured correctly"
            : "❌ GOOGLE_GEMINI_API_KEY environment variable is missing. Add it in Vercel: Settings → Environment Variables",
    });
}
