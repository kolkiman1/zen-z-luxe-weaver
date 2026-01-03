-- Drop the overly permissive "Deny anonymous access" policy
-- This policy allows ANY authenticated user to view ALL profiles
-- which is a security vulnerability exposing PII

DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- The existing policies already handle proper access control:
-- 1. "Users can view their own profile" - auth.uid() = user_id
-- 2. "Admins can view all profiles" - has_role(auth.uid(), 'admin')
-- No additional policy is needed