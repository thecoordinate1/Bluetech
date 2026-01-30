'use server';

import { initiateMobileMoneyCollection } from "@/services/lencoService";
import { MobileMoneyCollectionPayload } from "@/types/lenco";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type PaymentResult = {
    success: boolean;
    message?: string;
    data?: any;
};

export async function initiateMarketImportPayment(
    storeId: string,
    productId: string,
    provider: 'airtel' | 'mtn' | 'zamtel' | 'free_credit',
    phone: string,
    amount: number
): Promise<PaymentResult> {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "User not authenticated" };
    }

    // Generate unique reference
    const reference = `imp_${storeId}_${productId}_${Date.now()}`;

    // Handle Free Credit
    if (provider === 'free_credit') {
        const { getImportCreditStats } = await import("@/services/creditService");
        const creditStats = await getImportCreditStats(user.id);

        if (!creditStats.isEligible) {
            return { success: false, message: "You are not eligible for free import credits." };
        }

        // Create Transaction Record directly
        const { error } = await supabase.from('transactions').insert({
            store_id: storeId,
            amount: 0,
            currency: 'ZMW',
            status: 'completed',
            type: 'market_import',
            reference: reference,
            metadata: {
                product_id: productId,
                provider: 'free_credit',
                credit_used: true
            }
        });

        if (error) {
            console.error("Transaction Create Error:", error);
            return { success: false, message: "Failed to process free credit transaction." };
        }

        return {
            success: true,
            message: "Free import credit applied!",
            data: { reference, status: 'completed' }
        };
    }

    // Standard Payment Flow
    // Format amount to 2 decimal places string
    const amountString = amount.toFixed(2);

    const payload: MobileMoneyCollectionPayload = {
        amount: amountString,
        currency: 'ZMW',
        operator: provider,
        phone,
        reference
    };

    try {
        const response = await initiateMobileMoneyCollection(payload);

        if (response.status) {
            // Log pending transaction to DB
            await supabase.from('transactions').insert({
                store_id: storeId,
                amount: amount,
                currency: 'ZMW',
                status: 'pending',
                type: 'market_import',
                reference: reference,
                metadata: {
                    product_id: productId,
                    provider: provider,
                    mobile: phone
                }
            });

            return {
                success: true,
                message: "Payment initiated. Please check your phone.",
                data: response.data
            };
        } else {
            return { success: false, message: response.message || "Payment initiation failed" };
        }

    } catch (error: any) {
        console.error("Payment Action Error:", error);
        return { success: false, message: error.message || "An unexpected error occurred" };
    }
}
