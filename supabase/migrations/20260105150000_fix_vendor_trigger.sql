-- Migration to fix vendor creation trigger and RLS policies

-- 1. Redefine the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_display_name text;
BEGIN
  -- Determine display name with fallbacks
  v_display_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1),
    'Vendor'
  );

  -- Insert into vendors table with safe coalescing
  INSERT INTO public.vendors (
    id,
    email,
    display_name,
    avatar_url,
    bank_name,
    bank_account_name,
    bank_account_number,
    bank_branch_name,
    mobile_money_provider,
    mobile_money_number,
    mobile_money_name
  )
  VALUES (
    new.id,
    new.email,
    v_display_name,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'bank_name',
    new.raw_user_meta_data->>'bank_account_name',
    new.raw_user_meta_data->>'bank_account_number',
    new.raw_user_meta_data->>'bank_branch_name',
    new.raw_user_meta_data->>'mobile_money_provider',
    new.raw_user_meta_data->>'mobile_money_number',
    new.raw_user_meta_data->>'mobile_money_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.vendors.display_name),
    updated_at = now();

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but do not fail the transaction (allows auth user creation to succeed)
  RAISE WARNING 'handle_new_user trigger failed for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$;

-- 2. Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Update RLS Policies to allow JIT creation (Self-Healing)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile (Critical for JIT creation in storeService)
DROP POLICY IF EXISTS "Vendors can insert their own profile" ON public.vendors;
CREATE POLICY "Vendors can insert their own profile"
ON public.vendors FOR INSERT
WITH CHECK ( auth.uid() = id );

-- Ensure users can view their own profile
DROP POLICY IF EXISTS "Vendors can view their own profile" ON public.vendors;
CREATE POLICY "Vendors can view their own profile"
ON public.vendors FOR SELECT
USING ( auth.uid() = id );

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Vendors can update their own profile" ON public.vendors;
CREATE POLICY "Vendors can update their own profile"
ON public.vendors FOR UPDATE
USING ( auth.uid() = id );
