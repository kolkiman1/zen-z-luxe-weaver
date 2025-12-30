-- Add discount tracking to orders
ALTER TABLE public.orders 
ADD COLUMN discount_code_id UUID REFERENCES public.discount_codes(id) ON DELETE SET NULL,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX idx_orders_discount_code_id ON public.orders(discount_code_id);

-- Function to increment discount code usage
CREATE OR REPLACE FUNCTION public.increment_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes 
    SET used_count = used_count + 1 
    WHERE id = NEW.discount_code_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-increment usage count when order is placed
CREATE TRIGGER increment_discount_on_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.increment_discount_usage();