
import { createClient } from '@/lib/supabase/client';
import type { Settlement, SettlementStatus } from '@/lib/types';

const supabase = createClient();

export interface SettlementStats {
    pending: number;
    cleared: number;
    frozen: number;
}

export async function getSettlementStats(storeId: string): Promise<{ data: SettlementStats | null; error: Error | null }> {
    console.log(`[settlementService.getSettlementStats] Fetching stats for store ${storeId}`);

    const { data, error } = await supabase
        .from('settlements')
        .select('amount, status')
        .eq('store_id', storeId);

    if (error) {
        console.error('[settlementService.getSettlementStats] Error:', error);
        return { data: null, error: new Error(error.message) };
    }

    const stats: SettlementStats = {
        pending: 0,
        cleared: 0,
        frozen: 0
    };

    if (data) {
        data.forEach((item) => {
            const amount = Number(item.amount) || 0;
            if (item.status === 'pending') {
                stats.pending += amount;
            } else if (item.status === 'cleared') {
                stats.cleared += amount;
            } else if (item.status === 'frozen' || item.status === 'disputed') {
                stats.frozen += amount;
            }
        });
    }

    return { data: stats, error: null };
}

export async function getSettlements(
    storeId: string,
    page: number = 1,
    limit: number = 10
): Promise<{ data: Settlement[] | null; count: number | null; error: Error | null }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from('settlements')
        .select('*', { count: 'exact' })
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('[settlementService.getSettlements] Error:', error);
        return { data: null, count: null, error: new Error(error.message) };
    }

    // Cast to Settlement[] safely
    const settlements = (data || []).map(item => ({
        ...item,
        amount: Number(item.amount)
    })) as Settlement[];

    return { data: settlements, count, error: null };
}
