-- Add wholesale_price column to products table
-- This is the cost price for calculating commission/profit
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10,2) DEFAULT NULL;

COMMENT ON COLUMN public.products.wholesale_price IS 'The wholesale/cost price of the product. Used to calculate commission (selling price - wholesale price).';
