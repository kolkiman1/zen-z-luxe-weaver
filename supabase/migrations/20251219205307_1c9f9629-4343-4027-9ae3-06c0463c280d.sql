-- Drop the existing view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.inquiries_user_view;

-- Create the view with SECURITY INVOKER (uses querying user's permissions)
CREATE VIEW public.inquiries_user_view 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  name,
  email,
  subject,
  message,
  status,
  created_at,
  updated_at,
  -- Only show admin_notes to admins
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN admin_notes
    ELSE NULL
  END AS admin_notes
FROM public.inquiries;

-- Grant access to the view
GRANT SELECT ON public.inquiries_user_view TO authenticated;
GRANT SELECT ON public.inquiries_user_view TO anon;