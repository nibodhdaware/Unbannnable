import { NextRequest, NextResponse } from "next/server";

/**
 * Unsubscribe endpoint
 * Accessed via email link
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                new URL("/email-preferences?error=invalid_token", request.url),
            );
        }

        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("@/../convex/_generated/api");

        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );

        const result = await client.mutation(api.emails.unsubscribeByToken, {
            token,
        });

        if (result.success) {
            return NextResponse.redirect(
                new URL("/email-preferences?unsubscribed=true", request.url),
            );
        } else {
            return NextResponse.redirect(
                new URL(
                    `/email-preferences?error=${result.error || "unknown"}`,
                    request.url,
                ),
            );
        }
    } catch (error) {
        console.error("Error processing unsubscribe:", error);
        return NextResponse.redirect(
            new URL("/email-preferences?error=server_error", request.url),
        );
    }
}
