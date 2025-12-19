-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Users can create inquiries" ON public.inquiries;

-- Create a new policy that still allows public submissions but with better control
-- This is intentional for contact forms - users should be able to submit inquiries without logging in
-- The WITH CHECK ensures basic data validation at the database level
CREATE POLICY "Anyone can create inquiries" 
ON public.inquiries 
FOR INSERT 
TO public
WITH CHECK (
  -- Ensure required fields are provided (basic validation)
  name IS NOT NULL AND name <> '' AND
  email IS NOT NULL AND email <> '' AND
  subject IS NOT NULL AND subject <> '' AND
  message IS NOT NULL AND message <> '' AND
  -- Limit field lengths to prevent abuse
  length(name) <= 100 AND
  length(email) <= 255 AND
  length(subject) <= 200 AND
  length(message) <= 5000
);

-- Update the SELECT policy to be more restrictive for anonymous inquiries
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.inquiries;

-- Authenticated users can view their own inquiries, admins can view all
-- Anonymous inquiries (null user_id) can only be viewed by admins
CREATE POLICY "Users can view their own inquiries" 
ON public.inquiries 
FOR SELECT 
TO public
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update the admin update policy to use authenticated role
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;

CREATE POLICY "Admins can update inquiries" 
ON public.inquiries 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));