'use server';

import { initiateMobileMoneyCollection } from "@/services/lencoService";

export async function initiateSubscription(vendorId: string, planId: string, phone: string, provider: 'airtel' | 'mtn' | 'zamtel'): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        // Amount mapping
        const amount = planId === 'premium_monthly' ? "500.00" : "5000.00";
        const reference = `sub_${vendorId}_${Date.now()}`;

        const result = await initiateMobileMoneyCollection({
            amount,
            currency: 'ZMW',
            provider,
            phone,
            reference
        });

        if (result.status) {
            return {
                success: true,
                message: "Subscription payment initiated. Check your phone.",
                data: result.data
            };
        } else {
            return {
                success: false,
                message: result.message || "Failed to initiate subscription payment."
            };
        }

    } catch (error: any) {
        console.error('[subscriptionService] Payment initiation failed:', error);
        return { success: false, message: error.message || "Payment service unavailable" };
    }
}
