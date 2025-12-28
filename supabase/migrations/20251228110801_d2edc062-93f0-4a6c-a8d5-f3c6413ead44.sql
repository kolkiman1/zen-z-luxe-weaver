-- Add order_number column with auto-generated unique ID
ALTER TABLE public.orders ADD COLUMN order_number TEXT UNIQUE;

-- Create a function to generate unique order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  new_order_number TEXT;
  order_count INTEGER;
BEGIN
  -- Get count of orders for today to create sequential number
  SELECT COUNT(*) + 1 INTO order_count 
  FROM public.orders 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format: ORD-YYYYMMDD-XXXX (e.g., ORD-20251228-0001)
  new_order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 4, '0');
  
  -- Check if this order number already exists (edge case for concurrent orders)
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_order_number) LOOP
    order_count := order_count + 1;
    new_order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 4, '0');
  END LOOP;
  
  NEW.order_number := new_order_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate order number on insert
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION public.generate_order_number();

-- Backfill existing orders with order numbers
DO $$
DECLARE
  r RECORD;
  counter INTEGER := 1;
BEGIN
  FOR r IN SELECT id, created_at FROM public.orders ORDER BY created_at ASC
  LOOP
    UPDATE public.orders 
    SET order_number = 'ORD-' || TO_CHAR(r.created_at::DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0')
    WHERE id = r.id AND order_number IS NULL;
    counter := counter + 1;
  END LOOP;
END $$;