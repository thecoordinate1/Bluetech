
export interface MobileMoneyCollectionPayload {
    amount: string; // "100.00"
    currency: string; // "ZMW"
    provider: 'airtel' | 'mtn' | 'zamtel';
    phone: string;
    reference: string;
}

export interface LencoCollectionResponse {
    status: boolean;
    message: string;
    data: {
        id: string;
        initiatedAt: string;
        status: string; // "pending", "successful", "failed"
        mobileMoneyDetails: {
            phone: string;
            operator: string;
        } | null;
        [key: string]: any;
    };
}

export async function initiateMobileMoneyCollection(payload: MobileMoneyCollectionPayload): Promise<LencoCollectionResponse> {
    const url = 'https://api.lenco.co/access/v2/collections/mobile-money';
    const secretKey = process.env.LENCO_LIVE_SECRET_KEY;

    if (!secretKey) {
        throw new Error("Missing LENCO_LIVE_SECRET_KEY");
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[LencoService] API Error:', data);
            throw new Error(data.message || 'Failed to initiate mobile money collection');
        }

        return data as LencoCollectionResponse;

    } catch (error) {
        console.error('[LencoService] Network/Request Error:', error);
        throw error;
    }
}
