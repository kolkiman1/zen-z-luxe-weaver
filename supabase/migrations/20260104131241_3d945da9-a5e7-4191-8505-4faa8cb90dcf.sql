-- Add variants column to products table for tracking size/color availability with stock
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;

-- Comment explaining the structure
COMMENT ON COLUMN public.products.variants IS 'Array of {size, color, stock, sku} objects for variant-level inventory tracking';