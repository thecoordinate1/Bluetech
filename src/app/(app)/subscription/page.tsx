"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Check, Loader2, ShieldCheck, Zap } from "lucide-react";
import { initiateSubscription, type VendorSubscription, getSubscription } from "@/services/subscriptionService";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
    const [loading, setLoading] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const [userId, setUserId] = React.useState<string | null>(null);
    const [currentSub, setCurrentSub] = React.useState<VendorSubscription | null>(null);

    React.useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (user) {
                setUserId(user.id);
                const { data } = await getSubscription(user.id);
                setCurrentSub(data);
            }
        });
    }, [supabase]);

    const handleUpgrade = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { url, error } = await initiateSubscription(userId, 'premium_monthly');
            if (error) throw error;

            if (url) {
                // Redirect to payment provider
                window.location.href = url;
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to initiate payment",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        "Advanced Profit & Loss Reports",
        "Detailed Customer Insights",
        "Priority Support",
        "Unlimited Product Listings",
        "Lower Transaction Fees"
    ];

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex items-center justify-center">
            <Card className="max-w-md w-full shadow-lg border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                        <Zap className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Upgrade to Premium</CardTitle>
                    <CardDescription>Scale your business with advanced tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="text-center">
                        <span className="text-4xl font-bold">K500</span>
                        <span className="text-muted-foreground">/month</span>
                    </div>

                    <div className="space-y-3">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-0.5">
                                    <Check className="w-3 h-3" />
                                </div>
                                {benefit}
                            </div>
                        ))}
                    </div>

                    {currentSub?.status === 'active' ? (
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center text-green-700 dark:text-green-300 text-sm font-medium flex items-center justify-center gap-2">
                            {currentSub.plan_id === 'lifetime_premium' ? (
                                <>
                                    <ShieldCheck className="w-4 h-4" /> Lifetime Premium Access
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" /> You are currently subscribed!
                                </>
                            )}
                        </div>
                    ) : (
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium h-11" onClick={handleUpgrade} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? "Processing..." : "Subscribe Now"}
                        </Button>
                    )}

                </CardContent>
                <CardFooter className="justify-center border-t bg-muted/50 py-4">
                    <p className="text-xs text-muted-foreground text-center">
                        Payments processed securely by Lenco.
                        <br />Cancel anytime.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
