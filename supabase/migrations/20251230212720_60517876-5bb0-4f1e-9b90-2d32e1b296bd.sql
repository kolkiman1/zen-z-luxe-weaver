-- Fix security issue 1: Add policy to deny anonymous access to profiles
-- This ensures unauthenticated users cannot access profile data
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security issue 2: Enable RLS on inquiries_user_view and add policies
-- First, we need to handle the view security
-- Views don't support RLS directly, so we'll recreate it as a secure view with SECURITY INVOKER

-- Drop the existing view
DROP VIEW IF EXISTS public.inquiries_user_view;

-- Recreate the view with proper security (SECURITY INVOKER is default and uses caller's permissions)
CREATE VIEW public.inquiries_user_view
WITH (security_invoker = true)
AS
SELECT 
  id,
  email,
  name,
  subject,
  message,
  status,
  created_at,
  updated_at,
  user_id,
  CASE 
    WHEN public.has_role(auth.uid(), 'admin') THEN admin_notes
    ELSE NULL
  END as admin_notes
FROM public.inquiries
WHERE 
  -- Users can only see their own inquiries, admins can see all
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin');

-- Add more event types to the security_events table (for enhanced security monitoring)
-- Create index for faster queries on security_events
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON public.security_events(resolved);

-- Add columns for enhanced security tracking if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_events' AND column_name = 'country') THEN
    ALTER TABLE public.security_events ADD COLUMN country text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_events' AND column_name = 'city') THEN
    ALTER TABLE public.security_events ADD COLUMN city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_events' AND column_name = 'request_path') THEN
    ALTER TABLE public.security_events ADD COLUMN request_path text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_events' AND column_name = 'blocked') THEN
    ALTER TABLE public.security_events ADD COLUMN blocked boolean DEFAULT false;
  END IF;
END $$;