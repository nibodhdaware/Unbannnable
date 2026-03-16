export interface SubredditPseoTarget {
    slug: string;
    audience: string;
    postingTip: string;
}

export const SUBREDDIT_PSEO_TARGETS: SubredditPseoTarget[] = [
    { slug: "AskReddit", audience: "broad discussion", postingTip: "Lead with a clear question and avoid promotional links." },
    { slug: "Entrepreneur", audience: "founders and operators", postingTip: "Share specific lessons, numbers, and outcomes instead of generic advice." },
    { slug: "smallbusiness", audience: "small business owners", postingTip: "Use practical examples and clearly state your business context." },
    { slug: "startups", audience: "startup builders", postingTip: "Focus on traction, experiments, and transparent metrics." },
    { slug: "SaaS", audience: "SaaS operators", postingTip: "Provide actionable takeaways and avoid self-promo wording." },
    { slug: "marketing", audience: "marketers", postingTip: "Cite campaign details and remove hype-heavy claims." },
    { slug: "digital_marketing", audience: "digital marketers", postingTip: "Add channel-specific context and realistic performance data." },
    { slug: "socialmedia", audience: "social media practitioners", postingTip: "Keep claims evidence-based and include tactical steps." },
    { slug: "webdev", audience: "web developers", postingTip: "Show technical context, constraints, and implementation details." },
    { slug: "programming", audience: "software engineers", postingTip: "Use precise language and include reproducible examples." },
    { slug: "learnprogramming", audience: "new developers", postingTip: "Ask focused questions and include what you've already tried." },
    { slug: "reactjs", audience: "React developers", postingTip: "Include version info and concrete code snippets." },
    { slug: "nextjs", audience: "Next.js developers", postingTip: "Mention routing/runtime details and deployment environment." },
    { slug: "javascript", audience: "JavaScript developers", postingTip: "Share minimal examples and expected vs actual behavior." },
    { slug: "typescript", audience: "TypeScript developers", postingTip: "Include type definitions and compiler errors where relevant." },
    { slug: "ChatGPT", audience: "AI tool users", postingTip: "Describe prompts, constraints, and intended outputs clearly." },
    { slug: "MachineLearning", audience: "ML practitioners", postingTip: "Provide dataset/model context and avoid broad unverified claims." },
    { slug: "artificial", audience: "AI community", postingTip: "Anchor discussion in concrete use cases and practical tradeoffs." },
    { slug: "technology", audience: "tech enthusiasts", postingTip: "Keep headlines factual and avoid sensational framing." },
    { slug: "productivity", audience: "productivity-focused users", postingTip: "Share before/after workflows and measurable improvements." },
    { slug: "freelance", audience: "freelancers", postingTip: "Give real client context and realistic constraints." },
    { slug: "copywriting", audience: "writers and marketers", postingTip: "Lead with audience intent and avoid spam-like language." },
    { slug: "content_marketing", audience: "content marketers", postingTip: "Include distribution plan and evidence of content-market fit." },
    { slug: "SEO", audience: "SEO practitioners", postingTip: "Back claims with examples, SERP context, and methodology." },
    { slug: "ecommerce", audience: "ecommerce operators", postingTip: "Share channel, offer, and conversion context before asking for feedback." },
];
