import { MobileMoneyCollectionPayload, LencoCollectionResponse } from "@/types/lenco";

import { ProxyAgent } from 'undici';

export async function initiateMobileMoneyCollection(payload: MobileMoneyCollectionPayload): Promise<LencoCollectionResponse> {
    const url = 'https://api.lenco.co/access/v2/collections/mobile-money';
    const secretKey = process.env.LENCO_LIVE_SECRET_KEY;
    const fixieUrl = process.env.FIXIE_URL;

    if (!secretKey) {
        throw new Error("Missing LENCO_LIVE_SECRET_KEY");
    }

    try {
        let fetchOptions: RequestInit & { dispatcher?: any } = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        if (fixieUrl) {
            fetchOptions.dispatcher = new ProxyAgent(fixieUrl);
        }

        const response = await fetch(url, fetchOptions as RequestInit);

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
