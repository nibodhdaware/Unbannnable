import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { title, body, subreddit } = await request.json();

        const anomalies = [];

        // Check for suspicious patterns
        const content = `${title} ${body}`;

        // Check for excessive repetition
        const words = content.toLowerCase().split(/\s+/);
        const wordCounts = words.reduce((acc: any, word: string) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});

        const repeatedWords = Object.entries(wordCounts)
            .filter(
                ([word, count]: [string, any]) => count > 5 && word.length > 3,
            )
            .map(([word]) => word);

        if (repeatedWords.length > 0) {
            anomalies.push({
                type: "Repetition",
                description: `Excessive repetition of words: ${repeatedWords.join(", ")}`,
                severity: "medium",
            });
        }

        // Check for suspicious links
        const linkPattern = /https?:\/\/[^\s]+/g;
        const links = content.match(linkPattern) || [];

        if (links.length > 3) {
            anomalies.push({
                type: "Link Spam",
                description: `Too many links detected (${links.length}). Consider reducing to 1-2 relevant links.`,
                severity: "high",
            });
        }

        // Check for suspicious domains
        const suspiciousDomains = ["bit.ly", "tinyurl.com", "goo.gl", "t.co"];
        const hasSuspiciousLinks = links.some((link: string) =>
            suspiciousDomains.some((domain) => link.includes(domain)),
        );

        if (hasSuspiciousLinks) {
            anomalies.push({
                type: "Suspicious Links",
                description:
                    "Contains shortened or suspicious links that may be flagged as spam",
                severity: "high",
            });
        }

        // Check for excessive punctuation
        const exclamationCount = (content.match(/!/g) || []).length;
        const questionCount = (content.match(/\?/g) || []).length;

        if (exclamationCount > 5) {
            anomalies.push({
                type: "Excessive Punctuation",
                description:
                    "Too many exclamation marks - may appear spammy or unprofessional",
                severity: "low",
            });
        }

        // Check for all caps
        const capsWords = content
            .split(/\s+/)
            .filter(
                (word: string) =>
                    word.length > 3 &&
                    word === word.toUpperCase() &&
                    /[A-Z]/.test(word),
            );

        if (capsWords.length > 2) {
            anomalies.push({
                type: "Excessive Caps",
                description: `Too many words in all caps: ${capsWords.join(", ")}`,
                severity: "medium",
            });
        }

        // Check for potential self-promotion
        const selfPromoWords = [
            "my channel",
            "my blog",
            "my website",
            "check out",
            "subscribe",
            "follow me",
        ];
        const hasSelfPromo = selfPromoWords.some((phrase) =>
            content.toLowerCase().includes(phrase),
        );

        if (hasSelfPromo) {
            anomalies.push({
                type: "Self-Promotion",
                description:
                    "Content appears to be self-promotional - ensure it follows subreddit rules",
                severity: "medium",
            });
        }

        // Check for potential spam patterns
        const spamPatterns = [
            /free\s+(money|cash|bitcoin)/i,
            /click\s+here/i,
            /limited\s+time/i,
            /act\s+now/i,
        ];

        const hasSpamPatterns = spamPatterns.some((pattern) =>
            pattern.test(content),
        );

        if (hasSpamPatterns) {
            anomalies.push({
                type: "Spam Patterns",
                description:
                    "Content contains patterns commonly associated with spam",
                severity: "high",
            });
        }

        return NextResponse.json({
            anomalies,
            analyzed: true,
            subreddit,
        });
    } catch (error) {
        console.error("Error detecting anomalies:", error);
        return NextResponse.json(
            { error: "Failed to detect anomalies" },
            { status: 500 },
        );
    }
}
