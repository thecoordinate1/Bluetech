"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Crown } from "lucide-react";
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { type VendorSubscription } from "@/services/subscriptionService";

interface SubscriptionBannerProps {
    subscription: VendorSubscription | null;
}

export function SubscriptionBanner({ subscription }: SubscriptionBannerProps) {
    if (!subscription) return null; // Or show loading/default

    const { status, trial_ends_at } = subscription;

    if (status === 'active') return null; // Don't show banner for active subscribers

    let message = "";
    let type: "warning" | "error" | "info" = "info";
    let showButton = true;

    if (status === 'trial') {
        if (!trial_ends_at) return null;
        const daysLeft = differenceInDays(parseISO(trial_ends_at), new Date());

        if (daysLeft < 0) {
            // Should effectively be 'expired', but handle just in case
            message = "Your free trial has expired. Upgrade now to access premium features.";
            type = "error";
        } else if (daysLeft <= 5) {
            message = `Your free trial ends in ${daysLeft} days. Upgrade now to keep premium access.`;
            type = "warning";
        } else {
            // Don't show banner if trial is comfortably active (e.g. > 5 days)
            return null;
        }
    } else if (status === 'expired' || status === 'canceled' || status === 'past_due') {
        message = "Your subscription is inactive. Premium features are locked.";
        type = "error";
    }

    return (
        <Card className={`border-l-4 shadow-sm mb-6 ${type === 'error' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' :
                type === 'warning' ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10' :
                    'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
            }`}>
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {type === 'error' ? <AlertTriangle className="text-red-600 w-5 h-5 shrink-0" /> : <Crown className="text-amber-600 w-5 h-5 shrink-0" />}
                    <p className={`text-sm font-medium ${type === 'error' ? 'text-red-700 dark:text-red-300' : 'text-foreground'
                        }`}>
                        {message}
                    </p>
                </div>

                {showButton && (
                    <Button size="sm" className="whitespace-nowrap gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0" asChild>
                        <Link href="/subscription">
                            <Crown className="w-3.5 h-3.5" /> Upgrade Plan
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
