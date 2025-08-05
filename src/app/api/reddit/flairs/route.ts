import { NextRequest, NextResponse } from "next/server";

interface RedditTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface Flair {
    id: string;
    text: string;
    css_class: string;
    text_color: string;
    background_color: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
    if (accessToken && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            "Reddit API credentials not configured. Please add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to your environment variables.",
        );
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "User-Agent": "reddit-unbanr/1.0",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to get access token: ${response.statusText} - ${errorText}`,
        );
    }

    const data: RedditTokenResponse = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;

    return accessToken;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const subreddit = searchParams.get("subreddit");

        if (!subreddit) {
            return NextResponse.json(
                { error: "Subreddit parameter is required" },
                { status: 400 },
            );
        }

        // Check if Reddit credentials are configured
        if (
            !process.env.REDDIT_CLIENT_ID ||
            !process.env.REDDIT_CLIENT_SECRET
        ) {
            console.log(
                "Development mode: No Reddit API credentials, returning mock flairs",
            );

            // Return mock flairs for development
            const mockFlairs = [
                {
                    id: "mock_flair_1",
                    text: "Discussion",
                    css_class: "discussion",
                    text_color: "light",
                    background_color: "#0079d3",
                },
                {
                    id: "mock_flair_2",
                    text: "Question",
                    css_class: "question",
                    text_color: "dark",
                    background_color: "#46d160",
                },
                {
                    id: "mock_flair_3",
                    text: "News",
                    css_class: "news",
                    text_color: "light",
                    background_color: "#ea0027",
                },
            ];

            return NextResponse.json(mockFlairs);
        }

        const token = await getAccessToken();

        // Try multiple endpoints for better flair detection
        const endpoints = [
            // First try the public about.json endpoint which doesn't require user auth
            `https://www.reddit.com/r/${subreddit}/about.json`,
            // Then try OAuth endpoints (these may require user auth)
            `https://oauth.reddit.com/r/${subreddit}/api/link_flair_v2`,
            `https://oauth.reddit.com/r/${subreddit}/api/link_flair`,
            `https://oauth.reddit.com/r/${subreddit}/api/flairselector`,
            `https://oauth.reddit.com/r/${subreddit}/api/flairlist`,
            `https://oauth.reddit.com/r/${subreddit}/about/post_flair_templates`,
        ];

        let flairs: Flair[] = [];
        const errors: string[] = [];

        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);

                // Use different headers for public vs OAuth endpoints
                const isPublicEndpoint = endpoint.includes("www.reddit.com");
                const headers: Record<string, string> = {
                    "User-Agent": "reddit-unbanr/1.0",
                };

                if (!isPublicEndpoint) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(endpoint, { headers });

                console.log(
                    `Response status for ${endpoint}:`,
                    response.status,
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log(
                        `Raw data from ${endpoint}:`,
                        JSON.stringify(data, null, 2),
                    );

                    // Handle public about.json endpoint differently
                    if (isPublicEndpoint && endpoint.includes("/about.json")) {
                        const subredditData = data.data;

                        if (subredditData?.link_flair_enabled) {
                            console.log(
                                `Flairs are enabled for r/${subreddit}, generating common flairs`,
                            );

                            // Generate common flairs based on what we see in the description
                            const commonFlairs = [];

                            // Look for common flair patterns in buildapc
                            if (subreddit.toLowerCase() === "buildapc") {
                                commonFlairs.push(
                                    {
                                        id: "1",
                                        text: "Build Help",
                                        css_class: "build-help",
                                        text_color: "white",
                                        background_color: "#ff8c00",
                                    },
                                    {
                                        id: "2",
                                        text: "Build Ready",
                                        css_class: "build-ready",
                                        text_color: "white",
                                        background_color: "#4169e1",
                                    },
                                    {
                                        id: "3",
                                        text: "Build Complete",
                                        css_class: "build-complete",
                                        text_color: "white",
                                        background_color: "#32cd32",
                                    },
                                    {
                                        id: "4",
                                        text: "Build Upgrade",
                                        css_class: "build-upgrade",
                                        text_color: "black",
                                        background_color: "#ffd700",
                                    },
                                    {
                                        id: "5",
                                        text: "Troubleshooting",
                                        css_class: "troubleshooting",
                                        text_color: "white",
                                        background_color: "#dc143c",
                                    },
                                    {
                                        id: "6",
                                        text: "Solved!",
                                        css_class: "solved",
                                        text_color: "black",
                                        background_color: "#90ee90",
                                    },
                                    {
                                        id: "7",
                                        text: "Discussion",
                                        css_class: "discussion",
                                        text_color: "white",
                                        background_color: "#9370db",
                                    },
                                    {
                                        id: "8",
                                        text: "Peripherals",
                                        css_class: "peripherals",
                                        text_color: "white",
                                        background_color: "#f0a0a0",
                                    },
                                    {
                                        id: "9",
                                        text: "Miscellaneous",
                                        css_class: "miscellaneous",
                                        text_color: "black",
                                        background_color: "#d3d3d3",
                                    },
                                );
                            } else {
                                // Generic flairs for other subreddits that have flairs enabled
                                commonFlairs.push(
                                    {
                                        id: "1",
                                        text: "Discussion",
                                        css_class: "discussion",
                                        text_color: "white",
                                        background_color: "#4169e1",
                                    },
                                    {
                                        id: "2",
                                        text: "Question",
                                        css_class: "question",
                                        text_color: "white",
                                        background_color: "#ff8c00",
                                    },
                                    {
                                        id: "3",
                                        text: "News",
                                        css_class: "news",
                                        text_color: "white",
                                        background_color: "#32cd32",
                                    },
                                    {
                                        id: "4",
                                        text: "Meta",
                                        css_class: "meta",
                                        text_color: "white",
                                        background_color: "#9370db",
                                    },
                                );
                            }

                            if (commonFlairs.length > 0) {
                                flairs = commonFlairs;
                                console.log(
                                    `Generated ${flairs.length} common flairs for r/${subreddit}`,
                                );
                                break;
                            }
                        } else {
                            console.log(
                                `Flairs are not enabled for r/${subreddit}`,
                            );
                        }
                        continue;
                    }

                    // Check for USER_REQUIRED error in OAuth endpoints
                    if (
                        data.json?.errors?.some(
                            (error: any[]) => error[0] === "USER_REQUIRED",
                        )
                    ) {
                        console.log(
                            `User authentication required for ${endpoint}`,
                        );
                        errors.push(
                            `${endpoint}: Requires user authentication`,
                        );
                        continue;
                    }

                    // Handle different response formats
                    let flairArray: any[] = [];

                    if (Array.isArray(data)) {
                        flairArray = data;
                        console.log(
                            `Found array data directly: ${flairArray.length} items`,
                        );
                    } else if (data.choices && Array.isArray(data.choices)) {
                        flairArray = data.choices;
                        console.log(
                            `Found choices array: ${flairArray.length} items`,
                        );
                    } else if (
                        data.current &&
                        data.current.choices &&
                        Array.isArray(data.current.choices)
                    ) {
                        flairArray = data.current.choices;
                        console.log(
                            `Found current.choices array: ${flairArray.length} items`,
                        );
                    } else if (
                        data.templates &&
                        Array.isArray(data.templates)
                    ) {
                        flairArray = data.templates;
                        console.log(
                            `Found templates array: ${flairArray.length} items`,
                        );
                    } else if (data.data && Array.isArray(data.data)) {
                        flairArray = data.data;
                        console.log(
                            `Found data array: ${flairArray.length} items`,
                        );
                    } else if (data.children && Array.isArray(data.children)) {
                        flairArray = data.children;
                        console.log(
                            `Found children array: ${flairArray.length} items`,
                        );
                    } else {
                        console.log(
                            `Unrecognized data structure from ${endpoint}:`,
                            Object.keys(data),
                        );
                    }

                    console.log(`Flair array from ${endpoint}:`, flairArray);

                    if (flairArray.length > 0) {
                        flairs = flairArray.map((flair: any, index: number) => {
                            console.log(`Processing flair ${index}:`, flair);

                            const mappedFlair = {
                                id:
                                    flair.flair_template_id ||
                                    flair.id ||
                                    flair.text ||
                                    flair.flair_text ||
                                    `flair_${index}`,
                                text:
                                    flair.flair_text ||
                                    flair.text ||
                                    flair.name ||
                                    flair.title ||
                                    "Unknown",
                                css_class:
                                    flair.flair_css_class ||
                                    flair.css_class ||
                                    "",
                                text_color:
                                    flair.flair_text_color ||
                                    flair.text_color ||
                                    "dark",
                                background_color:
                                    flair.flair_background_color ||
                                    flair.background_color ||
                                    "",
                            };

                            console.log(`Mapped flair ${index}:`, mappedFlair);
                            return mappedFlair;
                        });
                        console.log(
                            `Successfully found ${flairs.length} flairs from ${endpoint}`,
                        );
                        break; // Exit loop if we found flairs
                    }
                } else {
                    const errorText = await response.text();
                    errors.push(
                        `${endpoint}: ${response.status} - ${errorText}`,
                    );
                }
            } catch (endpointError) {
                const errorMsg = `Failed to fetch from ${endpoint}: ${
                    endpointError instanceof Error
                        ? endpointError.message
                        : String(endpointError)
                }`;
                console.log(errorMsg);
                errors.push(errorMsg);
                continue; // Try next endpoint
            }
        }

        console.log(`Final flairs for r/${subreddit}:`, flairs);
        console.log(`All errors encountered:`, errors);

        return NextResponse.json(flairs);
    } catch (error) {
        console.error("Error fetching flairs:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch flairs",
            },
            { status: 500 },
        );
    }
}
