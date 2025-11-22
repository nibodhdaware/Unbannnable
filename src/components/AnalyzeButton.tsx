"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AnalyzeButtonProps {
    subreddit: string;
}

export function AnalyzeButton({ subreddit }: AnalyzeButtonProps) {
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    if (!isLoaded) {
        return (
            <Button
                size="lg"
                className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-8 py-6 text-lg rounded-xl opacity-50 cursor-not-allowed"
            >
                Loading...
            </Button>
        );
    }

    if (!isSignedIn) {
        return (
            <SignInButton
                mode="modal"
                forceRedirectUrl={`/app?subreddit=${subreddit}`}
            >
                <Button
                    size="lg"
                    className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-8 py-6 text-lg rounded-xl"
                >
                    Analyze for r/{subreddit}
                </Button>
            </SignInButton>
        );
    }

    return (
        <Button
            size="lg"
            className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-8 py-6 text-lg rounded-xl"
            onClick={() => router.push(`/app?subreddit=${subreddit}`)}
        >
            Analyze for r/{subreddit}
        </Button>
    );
}
