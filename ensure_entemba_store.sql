-- Database Fix for Entemba Store
-- Run this in your Supabase SQL Editor

DO $$ 
DECLARE 
    target_email TEXT := 'entemba.shop@gmail.com';
    v_id UUID;
    s_id UUID;
BEGIN
    -- 1. Find or Create Vendor
    SELECT id INTO v_id FROM public.vendors WHERE email = target_email;
    
    IF v_id IS NULL THEN
        -- Link to the auth user if it exists
        SELECT id INTO v_id FROM auth.users WHERE email = target_email;
        
        IF v_id IS NOT NULL THEN
            INSERT INTO public.vendors (id, display_name, email)
            VALUES (v_id, 'Entemba Admin', target_email)
            ON CONFLICT (id) DO UPDATE SET email = target_email;
        ELSE
            RAISE NOTICE 'User % not found in auth.users. Please sign up first.', target_email;
            RETURN;
        END IF;
    END IF;

    -- 2. Find or Create Store
    SELECT id INTO s_id FROM public.stores WHERE vendor_id = v_id LIMIT 1;

    IF s_id IS NULL THEN
        INSERT INTO public.stores (vendor_id, name, description, status, contact_email, slug)
        VALUES (v_id, 'Entemba', 'Welcome to Entemba official shop.', 'Active', target_email, 'entemba')
        RETURNING id INTO s_id;
        RAISE NOTICE 'Created new store for %', target_email;
    ELSE
        UPDATE public.stores 
        SET name = 'Entemba', 
            contact_email = target_email, 
            status = 'Active', 
            slug = COALESCE(slug, 'entemba')
        WHERE id = s_id;
        RAISE NOTICE 'Updated existing store for %', target_email;
    END IF;

    -- 3. Ensure RLS allows public viewing (Status must be 'Active')
    -- This is already handled by the status update above.

END $$;
