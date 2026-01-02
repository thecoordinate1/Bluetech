
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'expired';

export interface VendorSubscription {
    vendor_id: string;
    status: SubscriptionStatus;
    plan_id: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
}

export async function getSubscription(vendorId: string): Promise<{ data: VendorSubscription | null; error: Error | null }> {
    // Check for lifetime access first
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('is_lifetime_free')
        .eq('id', vendorId)
        .single();

    if (vendor && vendor.is_lifetime_free) {
        return {
            data: {
                vendor_id: vendorId,
                status: 'active',
                plan_id: 'lifetime_premium',
                trial_ends_at: null,
                current_period_end: new Date('2099-12-31').toISOString(),
            },
            error: null
        };
    }

    const { data, error } = await supabase
        .from('vendor_subscriptions')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

    if (error) {
        // If row not found, return null (no sub), don't error unless it's a real DB error
        if (error.code === 'PGRST116') return { data: null, error: null };

        console.error('[subscriptionService.getSubscription] Error:', error);
        return { data: null, error: new Error(error.message) };
    }

    return { data: data as VendorSubscription, error: null };
}

export async function checkAccess(vendorId: string, feature: string): Promise<boolean> {
    const { data: subscription } = await getSubscription(vendorId);

    if (!subscription) return false;

    // Always allow access if in trial
    if (subscription.status === 'trial') {
        if (subscription.trial_ends_at && new Date(subscription.trial_ends_at) > new Date()) {
            return true;
        } else {
            // Trial expired
            return false;
        }
    }

    // Active or Past Due (grace period) allows access
    if (subscription.status === 'active' || subscription.status === 'past_due') {
        return true;
    }

    return false;
}


import { initiateMobileMoneyCollection } from './lencoService';

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

