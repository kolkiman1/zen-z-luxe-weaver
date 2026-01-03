-- Fix admin_activity_logs: Ensure admins can only log actions under their own identity
-- The INSERT policy should validate that user_id matches auth.uid()

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_logs;

-- Recreate with validation that user_id matches the authenticated user
CREATE POLICY "Admins can insert activity logs" 
ON public.admin_activity_logs 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'admin'::app_role)
  AND user_id = auth.uid()
);