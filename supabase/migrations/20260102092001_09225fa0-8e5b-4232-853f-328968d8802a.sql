-- Add 'confirmed' status to orders if not already in the check constraint
-- First, check if we need to update the constraint

-- Drop the existing check constraint if it exists
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add a new check constraint that includes 'confirmed' status
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));