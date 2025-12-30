-- Create discount_codes table for storing promotional codes
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  min_order NUMERIC NOT NULL DEFAULT 0,
  usage_limit INTEGER NOT NULL DEFAULT 100,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Public can view active discount codes (for applying at checkout)
CREATE POLICY "Anyone can view active discount codes"
ON public.discount_codes
FOR SELECT
USING (is_active = true AND expires_at > now());

-- Admins can do everything
CREATE POLICY "Admins can view all discount codes"
ON public.discount_codes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create discount codes"
ON public.discount_codes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update discount codes"
ON public.discount_codes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete discount codes"
ON public.discount_codes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();