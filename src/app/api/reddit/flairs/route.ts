import { NextRequest, NextResponse } from "next/server";

interface Flair {
    id: string;
    text: string;
    css_class: string;
    text_color: string;
    background_color: string;
}

const USER_AGENT =
    process.env.REDDIT_USER_AGENT ||
    "unbannnable/1.0 (+https://unbannnable.com; contact: support@unbannnable.com)";

async function getAccessToken(): Promise<string> {
    // Prefer secure server vars; fall back to legacy NEXT_PUBLIC_ if still set
    const clientId =
        process.env.REDDIT_CLIENT_ID ||
        process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const clientSecret =
        process.env.REDDIT_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_REDDIT_CLIENT_SECRET;
    const refreshToken =
        process.env.REDDIT_REFRESH_TOKEN ||
        process.env.NEXT_PUBLIC_REDDIT_REFRESH_TOKEN;

    if (!clientId || !clientSecret) {
        throw new Error(
            "Missing REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET (or legacy NEXT_PUBLIC_ variants)",
        );
    }

    const headers: Record<string, string> = {
        Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
    };

    const body = new URLSearchParams(
        refreshToken
            ? { grant_type: "refresh_token", refresh_token: refreshToken }
            : { grant_type: "client_credentials" },
    );

    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers,
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`access_token request failed ${res.status}: ${text}`);
    }

    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) {
        throw new Error("No access_token in response");
    }
    return json.access_token;
}

// Function to extract flairs from Reddit's JSON API
async function fetchFlairsFromRedditAPI(subreddit: string): Promise<Flair[]> {
    try {
        console.log(
            `🔍 Fetching flairs from Reddit JSON API for r/${subreddit}...`,
        );

        // Try multiple approaches to get flairs
        const approaches = [
            // Approach 1: Direct JSON API
            // `https://www.reddit.com/r/${subreddit}/.json?limit=100`,
            // // Approach 2: JSON API with different parameters
            // `https://www.reddit.com/r/${subreddit}/.json?limit=50&sort=hot`,
            // // Approach 3: JSON API with new posts
            // `https://www.reddit.com/r/${subreddit}/new/.json?limit=50`,
            // // Approach 4: JSON API with top posts
            // `https://www.reddit.com/r/${subreddit}/top/.json?limit=50&t=week`,
            `https://www.reddit.com/r/${subreddit}/api/link_flair_v2.json`,
        ];

        const headers = {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
        };

        let allFlairs = new Map<string, Flair>();

        for (const url of approaches) {
            try {
                console.log(`🔍 Trying: ${url}`);

                const response = await fetch(url, {
                    headers,
                    signal: AbortSignal.timeout(8000), // 8 second timeout
                });

                if (!response.ok) {
                    console.log(`❌ Failed: ${response.status} for ${url}`);
                    continue;
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    console.log(`❌ Not JSON response for ${url}`);
                    continue;
                }

                const data = await response.json();

                if (!data.data || !data.data.children) {
                    console.log(`❌ Invalid JSON structure for ${url}`);
                    continue;
                }

                // Extract flairs from posts
                data.data.children.forEach((post: any) => {
                    if (post.data && post.data.link_flair_text) {
                        const flairText = post.data.link_flair_text;
                        const flairId =
                            post.data.link_flair_template_id ||
                            flairText.toLowerCase().replace(/\s+/g, "-");

                        if (!allFlairs.has(flairText)) {
                            allFlairs.set(flairText, {
                                id: flairId,
                                text: flairText,
                                css_class: post.data.link_flair_css_class || "",
                                text_color:
                                    post.data.link_flair_text_color || "dark",
                                background_color:
                                    post.data.link_flair_background_color ||
                                    "#dadada",
                            });
                        }
                    }
                });

                console.log(`✅ Successfully processed ${url}`);

                // If we found some flairs, we can stop trying more approaches
                if (allFlairs.size > 0) {
                    break;
                }
            } catch (error) {
                console.log(`❌ Error with ${url}:`, error);
                continue;
            }
        }

        const flairs = Array.from(allFlairs.values());
        console.log(
            `🎉 Found ${flairs.length} unique flairs from Reddit JSON API`,
        );
        console.log(
            `📋 Flairs: ${flairs.map((f: Flair) => f.text).join(", ")}`,
        );

        return flairs;
    } catch (error) {
        console.error(`❌ Error fetching from Reddit JSON API:`, error);
        return [];
    }
}

// Function to provide generic flairs when Reddit API returns none
function getGenericFlairsForSubreddit(subreddit: string): Flair[] {
    const sub = subreddit.toLowerCase();

    // Generic flairs based on subreddit type
    const genericFlairs: Flair[] = [
        {
            id: "discussion",
            text: "Discussion",
            css_class: "",
            text_color: "dark",
            background_color: "#2196f3",
        },
        {
            id: "question",
            text: "Question",
            css_class: "",
            text_color: "dark",
            background_color: "#ff9800",
        },
        {
            id: "help",
            text: "Help",
            css_class: "",
            text_color: "dark",
            background_color: "#f44336",
        },
        {
            id: "news",
            text: "News",
            css_class: "",
            text_color: "dark",
            background_color: "#4caf50",
        },
        {
            id: "showcase",
            text: "Showcase",
            css_class: "",
            text_color: "dark",
            background_color: "#9c27b0",
        },
    ];

    // Add subreddit-specific flairs based on common patterns
    if (
        sub.includes("programming") ||
        sub.includes("coding") ||
        sub.includes("dev")
    ) {
        genericFlairs.push(
            {
                id: "tutorial",
                text: "Tutorial",
                css_class: "",
                text_color: "dark",
                background_color: "#00bcd4",
            },
            {
                id: "project",
                text: "Project",
                css_class: "",
                text_color: "dark",
                background_color: "#ff5722",
            },
        );
    }

    if (
        sub.includes("business") ||
        sub.includes("entrepreneur") ||
        sub.includes("startup")
    ) {
        genericFlairs.push(
            {
                id: "success-story",
                text: "Success Story",
                css_class: "",
                text_color: "light",
                background_color: "#007373",
            },
            {
                id: "advice",
                text: "Advice",
                css_class: "",
                text_color: "dark",
                background_color: "#8bc34a",
            },
        );
    }

    if (sub.includes("gaming") || sub.includes("game")) {
        genericFlairs.push(
            {
                id: "meme",
                text: "Meme",
                css_class: "",
                text_color: "dark",
                background_color: "#ff6b8a",
            },
            {
                id: "review",
                text: "Review",
                css_class: "",
                text_color: "dark",
                background_color: "#ffc107",
            },
        );
    }

    return genericFlairs;
}

export async function GET(request: NextRequest) {
    const subreddit = request.nextUrl.searchParams.get("subreddit")?.trim();

    if (!subreddit) {
        return NextResponse.json(
            { error: "Subreddit parameter is required" },
            { status: 400 },
        );
    }

    console.log(`🎯 Fetching flairs via OAuth for r/${subreddit}`);

    try {
        const token = await getAccessToken();

        const url = `https://oauth.reddit.com/r/${subreddit}/api/link_flair_v2.json?raw_json=1`;
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": USER_AGENT,
                Accept: "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(12000),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(
                `❌ Reddit API error ${res.status} for ${url}: ${text.substring(0, 200)}`,
            );
            return NextResponse.json(
                { error: `Reddit API error ${res.status}` },
                { status: res.status },
            );
        }

        const data = await res.json();
        const rawFlairs: any[] = Array.isArray(data) ? data : [];

        const mapped: Flair[] = rawFlairs
            .map((f: any, index: number) => {
                const text: string =
                    f.text ||
                    (Array.isArray(f.richtext)
                        ? f.richtext
                              .map((rt: any) =>
                                  typeof rt.t === "string" ? rt.t : "",
                              )
                              .join(" ")
                        : "");
                if (!text) return null;
                return {
                    id: f.id || f.template_id || `flair-${index}`,
                    text,
                    css_class: f.css_class || "",
                    text_color: f.text_color || "dark",
                    background_color: f.background_color || "#dadada",
                } as Flair;
            })
            .filter(Boolean) as Flair[];

        const uniqueByText = new Map<string, Flair>();
        for (const flair of mapped) {
            if (!uniqueByText.has(flair.text))
                uniqueByText.set(flair.text, flair);
        }
        const result = Array.from(uniqueByText.values());

        const response = NextResponse.json(result);
        response.headers.set(
            "Cache-Control",
            "no-cache, no-store, must-revalidate",
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
        return response;
    } catch (error: any) {
        console.error("❌ Unexpected error fetching flairs:", error);
        const status =
            typeof error?.message === "string" &&
            error.message.includes("access_token")
                ? 401
                : 500;
        const response = NextResponse.json([], { status });
        response.headers.set(
            "Cache-Control",
            "no-cache, no-store, must-revalidate",
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
        return response;
    }
}
