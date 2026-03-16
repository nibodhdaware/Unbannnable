import { Button } from "@/components/ui/button";

interface AnalyzeButtonProps {
    subreddit: string;
}

export function AnalyzeButton({ subreddit }: AnalyzeButtonProps) {
    return (
        <Button asChild size="lg" className="h-14 rounded-none border-2 border-[#1A1A1A] bg-[#FF4D00] px-8 text-base font-bold uppercase tracking-wide text-white hover:bg-[#E04400]">
            <a href={`https://check.unbannnable.com/?subreddit=${encodeURIComponent(subreddit)}`}>
                Analyze for r/{subreddit}
            </a>
        </Button>
    );
}
