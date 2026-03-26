"use client";

import { useState, useEffect, useMemo } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "landing_draft_post";

interface DraftPost {
  subreddit: string;
  title: string;
  body: string;
  flair: string;
}

interface Subreddit {
  display_name: string;
  subscribers: number;
}

interface FlairOption {
  value: string;
  text: string;
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

  // Subreddit search states
  const [searchQuery, setSearchQuery] = useState("");
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(false);

  // Flair states
  const [availableFlairs, setAvailableFlairs] = useState<FlairOption[]>([]);
  const [isLoadingFlairs, setIsLoadingFlairs] = useState(false);

  // Load stored post from /app redirect
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

  // Fetch subreddits on mount
  useEffect(() => {
    const fetchSubreddits = async () => {
      try {
        setIsLoadingSubreddits(true);
        const response = await fetch(`/api/reddit/subreddits?limit=100`);
        if (response.ok) {
          const data = await response.json();
          setSubreddits(Array.isArray(data) ? data : data.subreddits || []);
        }
      } catch (error) {
        console.error("Error fetching subreddits:", error);
        setSubreddits([]);
      } finally {
        setIsLoadingSubreddits(false);
      }
    };

    fetchSubreddits();
  }, []);

  // Fetch flairs when subreddit changes
  useEffect(() => {
    const fetchFlairs = async () => {
      if (!subreddit.trim()) {
        setAvailableFlairs([]);
        return;
      }

      try {
        setIsLoadingFlairs(true);
        const response = await fetch(
          `/api/reddit/flairs?subreddit=${encodeURIComponent(subreddit)}`
        );
        if (response.ok) {
          const data = await response.json();
          const flairsArray = Array.isArray(data) ? data : [];
          const flairs: FlairOption[] = flairsArray.map((f: any) => ({
            value: f.id || f.value || f.text || f,
            text: f.text || f.value || f,
          }));
          setAvailableFlairs(flairs);
        } else {
          setAvailableFlairs([]);
        }
      } catch (error) {
        console.error("Error fetching flairs:", error);
        setAvailableFlairs([]);
      } finally {
        setIsLoadingFlairs(false);
      }
    };

    fetchFlairs();
  }, [subreddit]);

  // Fuzzy search for subreddits
  const filteredSubreddits = useMemo(() => {
    if (!searchQuery.trim()) {
      return subreddits.slice(0, 10);
    }

    const query = searchQuery.toLowerCase();
    return subreddits
      .filter((s) => s.display_name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [subreddits, searchQuery]);

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
        {/* Subreddit Select */}
        <div>
          <label className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2">
            Subreddit
          </label>
          <Select value={subreddit} onValueChange={(value) => {
            setSubreddit(value);
            setFlair("");
            setSearchQuery("");
          }}>
            <SelectTrigger className="w-full bg-[#F2F0E9] dark:bg-[#0F0F0F] text-[#1A1A1A] dark:text-[#F2F0E9] border-2 border-[#1A1A1A] dark:border-[#F2F0E9]/20 focus:border-[#FF4500] focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Select subreddit..." />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1A1A1A] border-2 border-[#1A1A1A] dark:border-[#F2F0E9]/20">
              {isLoadingSubreddits ? (
                <SelectItem value="loading" disabled>
                  Loading subreddits...
                </SelectItem>
              ) : filteredSubreddits.length === 0 ? (
                <SelectItem value="empty" disabled>
                  No subreddits found
                </SelectItem>
              ) : (
                filteredSubreddits.map((s) => (
                  <SelectItem
                    key={s.display_name}
                    value={s.display_name}
                    className="cursor-pointer text-[#1A1A1A] dark:text-[#F2F0E9] hover:bg-[#FF4500] hover:text-white focus:bg-[#FF4500] focus:text-white"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">r/{s.display_name}</span>
                      <span className="text-xs opacity-70">
                        {s.subscribers?.toLocaleString()} subscribers
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Title Input */}
        <div>
          <label className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2">
            Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            placeholder="Your post title..."
            className="bg-[#F2F0E9] dark:bg-[#0F0F0F] text-[#1A1A1A] dark:text-[#F2F0E9] border-2 border-[#1A1A1A] dark:border-[#F2F0E9]/20 focus:border-[#FF4500] focus:ring-0 focus:ring-offset-0 h-10"
          />
          <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] mt-1">
            {title.length}/300
          </div>
        </div>

        {/* Flair Select */}
        <div>
          <label className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2">
            Flair {availableFlairs.length === 0 && "(Optional)"}
          </label>
          {availableFlairs.length > 0 ? (
            <Select value={flair || availableFlairs[0].value} onValueChange={setFlair} disabled={isLoadingFlairs}>
              <SelectTrigger className="w-full bg-[#F2F0E9] dark:bg-[#0F0F0F] text-[#1A1A1A] dark:text-[#F2F0E9] border-2 border-[#1A1A1A] dark:border-[#F2F0E9]/20 focus:border-[#FF4500] focus:ring-0 focus:ring-offset-0 disabled:opacity-50">
                <SelectValue
                  placeholder={
                    isLoadingFlairs
                      ? "Loading flairs..."
                      : "Select flair..."
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#1A1A1A] border-2 border-[#1A1A1A] dark:border-[#F2F0E9]/20">
                {availableFlairs.map((f) => (
                  <SelectItem
                    key={f.value}
                    value={f.value}
                    className="cursor-pointer text-[#1A1A1A] dark:text-[#F2F0E9] hover:bg-[#FF4500] hover:text-white focus:bg-[#FF4500] focus:text-white"
                  >
                    {f.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="w-full bg-[#F2F0E9] dark:bg-[#0F0F0F] text-[#6B6B6B] dark:text-[#A0A0A0] p-3 border-2 border-[#1A1A1A]/20 dark:border-[#F2F0E9]/20 rounded-lg">
              {isLoadingFlairs ? "Loading flairs..." : "No flairs available"}
            </div>
          )}
        </div>

        {/* Body Input */}
        <div>
          <label className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2">
            Body (Optional)
          </label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your post here..."
            rows={4}
            className="bg-[#F2F0E9] dark:bg-[#0F0F0F] text-[#1A1A1A] dark:text-[#F2F0E9] border-2 border-[#1A1A1A] dark:border-[#F2F0E9]/20 focus:border-[#FF4500] focus:ring-0 focus:ring-offset-0 resize-none"
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
