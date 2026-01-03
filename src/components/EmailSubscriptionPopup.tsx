"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface EmailSubscriptionPopupProps {
    onComplete?: () => void;
}

export default function EmailSubscriptionPopup({
    onComplete,
}: EmailSubscriptionPopupProps) {
    const { user, isLoaded } = useUser();
    const [showPopup, setShowPopup] = useState(false);
    const [newsletter, setNewsletter] = useState(true);
    const [promotional, setPromotional] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoaded || !user) return;

        // Check if we've already shown the popup for this user
        const shownKey = `email-subscription-shown-${user.id}`;
        const hasShown = localStorage.getItem(shownKey);

        if (!hasShown) {
            // Small delay after signup to show popup
            const timer = setTimeout(() => {
                setShowPopup(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, user]);

    const handleSubmit = async () => {
        if (!user) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/email-preferences/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    fullName: user.fullName || user.firstName || "",
                    newsletter,
                    promotional,
                }),
            });

            if (!response.ok) {
                console.error("Failed to update email preferences");
            }

            // Mark as shown
            localStorage.setItem(`email-subscription-shown-${user.id}`, "true");
            setShowPopup(false);
            onComplete?.();
        } catch (error) {
            console.error("Error updating email preferences:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (user) {
            localStorage.setItem(`email-subscription-shown-${user.id}`, "true");
        }
        setShowPopup(false);
        onComplete?.();
    };

    if (!showPopup) return null;

    return (
        <Dialog
            open={showPopup}
            onOpenChange={(open: boolean) => !open && handleSkip()}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Stay in the Loop</DialogTitle>
                    <DialogDescription>
                        Choose what emails you&apos;d like to receive from us.
                        You can change these preferences anytime.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="newsletter"
                            checked={newsletter}
                            onCheckedChange={(
                                checked: boolean | "indeterminate",
                            ) => setNewsletter(checked === true)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="newsletter"
                                className="font-medium cursor-pointer"
                            >
                                Product Updates
                            </Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                New features, tips for better Reddit posting,
                                and platform updates.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="promotional"
                            checked={promotional}
                            onCheckedChange={(
                                checked: boolean | "indeterminate",
                            ) => setPromotional(checked === true)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="promotional"
                                className="font-medium cursor-pointer"
                            >
                                Special Offers
                            </Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Exclusive discounts, credit bonuses, and
                                limited-time deals.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={isSubmitting}
                    >
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isSubmitting ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
