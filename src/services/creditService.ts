
import { createClient } from "@/lib/supabase/client";
import { getStoresByUserId } from "./storeService";

export interface ImportCreditStats {
    remaining: number;
    total: number;
    used: number;
    isEligible: boolean;
    reason?: string;
}

const supabase = createClient();

export async function getImportCreditStats(userId: string): Promise<ImportCreditStats> {
    // 1. Check vendor account age
    const { data: vendor } = await supabase
        .from('vendors')
        .select('created_at')
        .eq('id', userId)
        .single();

    if (!vendor) {
        return { remaining: 0, total: 3, used: 0, isEligible: false, reason: "Vendor not found" };
    }

    const createdDate = new Date(vendor.created_at);
    // createdDate.setMonth(createdDate.getMonth() + 1); // Promo ends 1 month after creation
    const oneMonthFromNow = new Date(createdDate);
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);

    if (new Date() > oneMonthFromNow) {
        return { remaining: 0, total: 3, used: 0, isEligible: false, reason: "Promotion expired" };
    }

    // 2. Count used credits (completed market_import transactions)
    // We need to check all stores owned by this vendor
    const { data: stores } = await getStoresByUserId(userId);

    if (!stores || stores.length === 0) {
        return { remaining: 3, total: 3, used: 0, isEligible: true };
    }

    const storeIds = stores.map(s => s.id);

    const { count, error } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .in('store_id', storeIds)
        .eq('type', 'market_import')
        .neq('status', 'failed'); // Count pending or completed as used to prevent race condition abuse

    if (error) {
        console.error("Error counting credits:", error);
        return { remaining: 0, total: 3, used: 3, isEligible: false, reason: "Error checking credits" };
    }

    const used = count || 0;
    const remaining = Math.max(0, 3 - used);

    return {
        remaining,
        total: 3,
        used,
        isEligible: remaining > 0,
        reason: remaining === 0 ? "Credits exhausted" : undefined
    };
}
