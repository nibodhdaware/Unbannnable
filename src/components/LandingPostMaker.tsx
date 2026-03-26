"use client";

import { useState, useEffect } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "landing_draft_post";

interface DraftPost {
  subreddit: string;
  title: string;
  body: string;
  flair: string;
}

export default function LandingPostMaker() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [subreddit, setSubreddit] = useState("AskReddit");
  const [title, setTitle] = useState(
    "Introducing Unbannnable: AI-powered Reddit post optimizer"
  );
  const [body, setBody] = useState(
    "Have you ever posted on Reddit and got banned? This tool helps you optimize your posts to follow subreddit rules and avoid bans."
  );
  const [flair, setFlair] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasStoredData, setHasStoredData] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored) as DraftPost;
          setSubreddit(data.subreddit);
          setTitle(data.title);
          setBody(data.body);
          setFlair(data.flair);
          localStorage.removeItem(STORAGE_KEY);
          setHasStoredData(true);
        } catch (e) {
          console.error("Error loading stored post:", e);
        }
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const handleAnalyze = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!isSignedIn) {
      const draft: DraftPost = {
        subreddit,
        title,
        body,
        flair,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setIsAnalyzing(true);
    } else {
      // Redirect to app with the post data
      window.location.href = "/app";
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="border-2 border-[#1A1A1A] rounded-lg p-6 bg-white dark:bg-neutral-900 shadow-lg max-w-md mx-auto">
      <div className="text-center font-bold mb-6 text-lg text-[#1A1A1A] dark:text-white">
        Try It Free
      </div>

      <div className="space-y-4">
        {/* Subreddit Input */}
        <div>
          <label
            htmlFor="subreddit"
            className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2"
          >
            Subreddit
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[#3C3C3C] dark:text-neutral-400">
              r/
            </span>
            <input
              id="subreddit"
              type="text"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              placeholder="AskReddit"
              className="w-full bg-[#F2F0E9] dark:bg-neutral-800 text-[#1A1A1A] dark:text-white p-2 pl-8 border-2 border-[#1A1A1A]/20 dark:border-neutral-600 rounded-lg focus:border-[#FF4500] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            placeholder="Your post title..."
            className="w-full bg-[#F2F0E9] dark:bg-neutral-800 text-[#1A1A1A] dark:text-white p-2 border-2 border-[#1A1A1A]/20 dark:border-neutral-600 rounded-lg focus:border-[#FF4500] outline-none transition-colors"
          />
          <div className="text-xs text-[#6B6B6B] dark:text-neutral-400 mt-1">
            {title.length}/300
          </div>
        </div>

        {/* Flair Input */}
        <div>
          <label
            htmlFor="flair"
            className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2"
          >
            Flair (Optional)
          </label>
          <input
            id="flair"
            type="text"
            value={flair}
            onChange={(e) => setFlair(e.target.value)}
            placeholder="e.g., Discussion, Question"
            className="w-full bg-[#F2F0E9] dark:bg-neutral-800 text-[#1A1A1A] dark:text-white p-2 border-2 border-[#1A1A1A]/20 dark:border-neutral-600 rounded-lg focus:border-[#FF4500] outline-none transition-colors"
          />
        </div>

        {/* Body Input */}
        <div>
          <label
            htmlFor="body"
            className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2"
          >
            Body (Optional)
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your post here..."
            rows={4}
            className="w-full bg-[#F2F0E9] dark:bg-neutral-800 text-[#1A1A1A] dark:text-white p-2 border-2 border-[#1A1A1A]/20 dark:border-neutral-600 rounded-lg focus:border-[#FF4500] outline-none transition-colors resize-none"
          />
        </div>

        {/* Analyze Button */}
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold py-3 rounded-lg transition-colors"
            >
              {isAnalyzing ? "Redirecting..." : "Analyze Now →"}
            </Button>
          </SignInButton>
        ) : (
          <Button
            onClick={handleAnalyze}
            className="w-full bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold py-3 rounded-lg transition-colors"
          >
            Analyze Now →
          </Button>
        )}

        {hasStoredData && (
          <div className="text-sm text-center text-green-600 dark:text-green-400 font-medium">
            ✓ Your draft post was loaded
          </div>
        )}
      </div>
    </div>
  );
}
