"use client";

import { useState, useEffect, useMemo } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Flair states
  const [availableFlairs, setAvailableFlairs] = useState<FlairOption[]>([]);
  const [isLoadingFlairs, setIsLoadingFlairs] = useState(false);
  const [isFlairDropdownOpen, setIsFlairDropdownOpen] = useState(false);

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
        const response = await fetch(
          `/api/reddit/subreddits?limit=100`
        );
        if (response.ok) {
          const data = await response.json();
          setSubreddits(data.subreddits || []);
        }
      } catch (error) {
        console.error("Error fetching subreddits:", error);
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
          const flairs: FlairOption[] = (data.flairs || []).map(
            (f: any) => ({
              value: f.value || f.text || f,
              text: f.text || f.value || f,
            })
          );
          setAvailableFlairs(flairs);
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

  const handleSubredditSelect = (name: string) => {
    setSubreddit(name);
    setSearchQuery("");
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    setFlair(""); // Reset flair when changing subreddit
  };

  const handleSubredditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSubreddits.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSubredditSelect(filteredSubreddits[selectedIndex].display_name);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    }
  };

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
        {/* Subreddit Search Dropdown */}
        <div>
          <label
            htmlFor="subreddit"
            className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2"
          >
            Subreddit
          </label>
          <div className="relative">
            <div className="flex items-center">
              <span className="absolute left-3 text-[#3C3C3C] dark:text-neutral-400 pointer-events-none">
                r/
              </span>
              <input
                id="subreddit"
                type="text"
                value={searchQuery || subreddit}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  setIsDropdownOpen(true);
                  setSearchQuery("");
                }}
                onKeyDown={handleSubredditKeyDown}
                placeholder="Search subreddit..."
                className="w-full bg-[#F2F0E9] dark:bg-neutral-800 text-[#1A1A1A] dark:text-white p-2 pl-8 pr-8 border-2 border-[#1A1A1A]/20 dark:border-neutral-600 rounded-lg focus:border-[#FF4500] outline-none transition-colors"
              />
              <ChevronDown className="absolute right-3 w-4 h-4 text-[#3C3C3C] dark:text-neutral-400 pointer-events-none" />
            </div>

            {/* Dropdown List */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border-2 border-[#1A1A1A]/20 dark:border-neutral-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                {isLoadingSubreddits ? (
                  <div className="p-3 text-center text-[#6B6B6B] dark:text-neutral-400 text-sm">
                    Loading subreddits...
                  </div>
                ) : filteredSubreddits.length === 0 ? (
                  <div className="p-3 text-center text-[#6B6B6B] dark:text-neutral-400 text-sm">
                    No subreddits found
                  </div>
                ) : (
                  filteredSubreddits.map((s, idx) => (
                    <button
                      key={s.display_name}
                      onClick={() => handleSubredditSelect(s.display_name)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        idx === selectedIndex
                          ? "bg-[#FF4500] text-white"
                          : "hover:bg-[#F2F0E9] dark:hover:bg-neutral-700 text-[#1A1A1A] dark:text-white"
                      }`}
                    >
                      <div className="font-medium">r/{s.display_name}</div>
                      <div className="text-xs opacity-70">
                        {s.subscribers?.toLocaleString()} subscribers
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
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

        {/* Flair Dropdown */}
        <div>
          <label
            htmlFor="flair"
            className="text-sm font-medium text-[#1A1A1A] dark:text-white block mb-2"
          >
            Flair {availableFlairs.length === 0 && "(Optional)"}
          </label>
          <div className="relative">
            <button
              onClick={() =>
                availableFlairs.length > 0 &&
                setIsFlairDropdownOpen(!isFlairDropdownOpen)
              }
              className="w-full bg-[#F2F0E9] dark:bg-neutral-800 text-[#1A1A1A] dark:text-white p-2 border-2 border-[#1A1A1A]/20 dark:border-neutral-600 rounded-lg focus:border-[#FF4500] outline-none transition-colors flex items-center justify-between"
            >
              <span>
                {flair
                  ? availableFlairs.find((f) => f.value === flair)?.text || flair
                  : "Select flair..."}
              </span>
              {isLoadingFlairs ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Flair Dropdown List */}
            {isFlairDropdownOpen && availableFlairs.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border-2 border-[#1A1A1A]/20 dark:border-neutral-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                <button
                  onClick={() => {
                    setFlair("");
                    setIsFlairDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#F2F0E9] dark:hover:bg-neutral-700 text-[#1A1A1A] dark:text-white transition-colors"
                >
                  None
                </button>
                {availableFlairs.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setFlair(f.value);
                      setIsFlairDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      flair === f.value
                        ? "bg-[#FF4500] text-white"
                        : "hover:bg-[#F2F0E9] dark:hover:bg-neutral-700 text-[#1A1A1A] dark:text-white"
                    }`}
                  >
                    {f.text}
                  </button>
                ))}
              </div>
            )}
          </div>
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

