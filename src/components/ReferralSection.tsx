"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Users, Gift } from "lucide-react";

interface ReferralSectionProps {
    className?: string;
}

export default function ReferralSection({ className }: ReferralSectionProps) {
    const { user } = useUser();
    const [copyNotification, setCopyNotification] = useState<string | null>(
        null,
    );
    const [referralCode, setReferralCode] = useState<string>("");
    const [referralCount, setReferralCount] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);

    useEffect(() => {
        if (user) {
            // Generate a simple referral code based on user ID
            const code = user.id.slice(-8).toUpperCase();
            setReferralCode(code);

            // These would normally come from your database
            // For now, using placeholder values
            setReferralCount(0);
            setTotalEarned(0);
        }
    }, [user]);

    const generateReferralLink = () => {
        if (!referralCode) return "";
        const baseUrl = window.location.origin;
        return `${baseUrl}/?ref=${referralCode}`;
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyNotification(`${type} copied to clipboard!`);
            setTimeout(() => setCopyNotification(null), 3000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const shareReferralLink = async () => {
        const link = generateReferralLink();
        const shareData = {
            title: "Check out Unbannnable - Reddit Post Optimization",
            text: "Avoid Reddit post removals with AI-powered rule compliance checking!",
            url: link,
        };

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
                copyToClipboard(link, "Referral link");
            }
        } else {
            copyToClipboard(link, "Referral link");
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className={`space-y-6 ${className || ""}`}>
            {/* Copy Notification */}
            {copyNotification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
                    {copyNotification}
                </div>
            )}

            {/* Referral Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {referralCount}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                        Referrals
                    </div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Gift className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalEarned}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                        Credits Earned
                    </div>
                </div>

                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        10
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                        Credits per Referral
                    </div>
                </div>
            </div>

            {/* How it Works */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">
                    How Referrals Work
                </h4>
                <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            1
                        </span>
                        <span>
                            Share your unique referral link with friends
                        </span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            2
                        </span>
                        <span>They sign up and use Unbannnable</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            3
                        </span>
                        <span>You both get 10 credits automatically!</span>
                    </div>
                </div>
            </div>

            {/* Referral Code and Link */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Your Referral Code
                    </label>
                    <div className="flex items-center space-x-2">
                        <Badge
                            variant="secondary"
                            className="text-lg px-3 py-1 font-mono"
                        >
                            {referralCode}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                copyToClipboard(referralCode, "Referral code")
                            }
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Your Referral Link
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            readOnly
                            value={generateReferralLink()}
                            className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                copyToClipboard(
                                    generateReferralLink(),
                                    "Referral link",
                                )
                            }
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Share Button */}
                <Button
                    onClick={shareReferralLink}
                    className="w-full bg-[#FF4500] hover:bg-[#e03d00] text-white"
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Referral Link
                </Button>
            </div>

            {/* Referral Terms */}
            <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                <p>
                    • Credits are awarded when referred users sign up and
                    complete their first post check
                </p>
                <p>• Both you and your friend receive 10 credits</p>
                <p>
                    • Credits never expire and can be used for any premium
                    features
                </p>
                <p>• Referral abuse may result in credit removal</p>
            </div>
        </div>
    );
}

