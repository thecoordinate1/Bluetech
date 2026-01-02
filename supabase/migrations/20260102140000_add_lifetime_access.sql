-- Add is_lifetime_free column to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS is_lifetime_free BOOLEAN DEFAULT FALSE;

-- Grant functionality to specific existing users
UPDATE public.vendors
SET is_lifetime_free = TRUE
WHERE email IN (
    'entemba.shop@gmail.com',
    'pabondi.shop@gmail.com',
    'mapalolungu65@gmail.com'
);
