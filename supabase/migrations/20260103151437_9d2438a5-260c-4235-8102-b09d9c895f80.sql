-- Fix email_logs table: Ensure anonymous users cannot access any data
-- Update the admin SELECT policy to explicitly require authentication

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;

-- Recreate with explicit authentication check to deny anonymous access
CREATE POLICY "Admins can view email logs" 
ON public.email_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));