-- Create transactions table to track all payments and credits
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'ZMW',
    status TEXT NOT NULL, -- pending, completed, failed
    type TEXT NOT NULL, -- market_import, subscription, ...
    reference TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for counting imports
CREATE INDEX IF NOT EXISTS idx_transactions_store_type_created ON public.transactions(store_id, type, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference);
