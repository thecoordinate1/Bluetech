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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key: string]: any;
        } | null;
        [key: string]: any;
    };
}
