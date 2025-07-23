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

    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Reddit API credentials not found");
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

        const token = await getAccessToken();

        // Try multiple endpoints for better flair detection
        const endpoints = [
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
                const response = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "User-Agent": "reddit-unbanr/1.0",
                    },
                });

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

                    // Handle different response formats
                    let flairArray: any[] = [];

                    if (Array.isArray(data)) {
                        flairArray = data;
                        console.log(`Found array data directly: ${flairArray.length} items`);
                    } else if (data.choices && Array.isArray(data.choices)) {
                        flairArray = data.choices;
                        console.log(`Found choices array: ${flairArray.length} items`);
                    } else if (
                        data.current &&
                        data.current.choices &&
                        Array.isArray(data.current.choices)
                    ) {
                        flairArray = data.current.choices;
                        console.log(`Found current.choices array: ${flairArray.length} items`);
                    } else if (
                        data.templates &&
                        Array.isArray(data.templates)
                    ) {
                        flairArray = data.templates;
                        console.log(`Found templates array: ${flairArray.length} items`);
                    } else if (data.data && Array.isArray(data.data)) {
                        flairArray = data.data;
                        console.log(`Found data array: ${flairArray.length} items`);
                    } else if (data.children && Array.isArray(data.children)) {
                        flairArray = data.children;
                        console.log(`Found children array: ${flairArray.length} items`);
                    } else {
                        console.log(`Unrecognized data structure from ${endpoint}:`, Object.keys(data));
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

        // If no flairs found, let's try a different approach for well-known flair subreddits
        if (flairs.length === 0 && ['buildapc', 'pcmasterrace', 'techsupport', 'help'].includes(subreddit.toLowerCase())) {
            console.log(`Trying alternative approach for r/${subreddit}`);
            try {
                // Try the basic subreddit info endpoint to see if we can find flair info
                const altResponse = await fetch(`https://oauth.reddit.com/r/${subreddit}/about`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "User-Agent": "reddit-unbanr/1.0",
                    },
                });
                
                if (altResponse.ok) {
                    const altData = await altResponse.json();
                    console.log(`Alternative data for r/${subreddit}:`, JSON.stringify(altData, null, 2));
                }
            } catch (e) {
                console.log(`Alternative approach failed:`, e);
            }
        }

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
