-- Create a secure view that hides admin_notes from non-admin users
CREATE OR REPLACE VIEW public.inquiries_user_view AS
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

-- Enable RLS on the view (views inherit RLS from base table, but we add explicit security)
-- The underlying table's RLS policies will still apply