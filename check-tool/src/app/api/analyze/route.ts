import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { postText, subreddit } = body;

        console.log("Received request:", {
            postText: postText?.substring(0, 50),
            subreddit,
        });

        if (!postText || typeof postText !== "string" || !postText.trim()) {
            console.error("Invalid post text:", postText);
            return NextResponse.json(
                {
                    error: "Post text is required and must be a non-empty string",
                },
                { status: 400 },
            );
        }

        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            console.error("GOOGLE_GEMINI_API_KEY not configured");
            return NextResponse.json(
                {
                    error: "API key not configured",
                    details:
                        "Please add GOOGLE_GEMINI_API_KEY environment variable in Vercel project settings",
                    hint: "Go to Vercel Dashboard → Project Settings → Environment Variables",
                },
                { status: 500 },
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are a Reddit moderation expert. Analyze this post for potential rule violations that could lead to a ban or removal.

Subreddit: ${subreddit || "general Reddit"}
Post Content:
"""
${postText}
"""

Analyze the post and provide:
1. A ban risk percentage (0-100%)
2. Risk level (low, medium, high, or critical)
3. Specific issues that could cause problems
4. Suggestions to fix the post

Consider common Reddit violations:
- Self-promotion/spam
- Low effort content
- Rule violations (title format, minimum karma, etc.)
- Toxic/offensive language
- Asking for upvotes
- Duplicate content
- Not following subreddit-specific rules

Respond in this EXACT JSON format:
{
  "banRisk": <number 0-100>,
  "risk_level": "<low|medium|high|critical>",
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "reasoning": "brief explanation"
}`;

        console.log("Calling Gemini API...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini response received, length:", text.length);

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No JSON found in response:", text);
            throw new Error("Invalid AI response format - no JSON found");
        }

        const analysis = JSON.parse(jsonMatch[0]);
        console.log("Parsed analysis:", analysis);

        // Validate response structure
        if (
            typeof analysis.banRisk !== "number" ||
            !analysis.risk_level ||
            !Array.isArray(analysis.issues) ||
            !Array.isArray(analysis.suggestions)
        ) {
            console.error("Invalid analysis structure:", analysis);
            throw new Error("Invalid analysis structure from AI");
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            {
                error: "Failed to analyze post",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
