-- Enable RLS on stores table (ensure it is enabled)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Policy: Vendors can create stores
-- This allows authenticated users to insert a row where the vendor_id matches their own ID.
DROP POLICY IF EXISTS "Vendors can create stores" ON public.stores;
CREATE POLICY "Vendors can create stores"
ON public.stores FOR INSERT
WITH CHECK ( auth.uid() = vendor_id );

-- Policy: Vendors can view their own stores
-- This allows vendors to see their stores even if status is 'Inactive'
DROP POLICY IF EXISTS "Vendors can view their own stores" ON public.stores;
CREATE POLICY "Vendors can view their own stores"
ON public.stores FOR SELECT
USING ( auth.uid() = vendor_id );

-- Policy: Vendors can update their own stores
DROP POLICY IF EXISTS "Vendors can update their own stores" ON public.stores;
CREATE POLICY "Vendors can update their own stores"
ON public.stores FOR UPDATE
USING ( auth.uid() = vendor_id );

-- Policy: Vendors can delete their own stores
DROP POLICY IF EXISTS "Vendors can delete their own stores" ON public.stores;
CREATE POLICY "Vendors can delete their own stores"
ON public.stores FOR DELETE
USING ( auth.uid() = vendor_id );
