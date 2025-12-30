-- Create a table to store pending admin invitations
CREATE TABLE public.pending_admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_admin_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pending invites
CREATE POLICY "Admins can view pending invites"
ON public.pending_admin_invites
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert pending invites"
ON public.pending_admin_invites
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pending invites"
ON public.pending_admin_invites
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update handle_new_user function to check for pending admin invites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pending_invite RECORD;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Check if there's a pending admin invite for this email
  SELECT * INTO pending_invite FROM public.pending_admin_invites WHERE email = LOWER(NEW.email);
  
  IF FOUND THEN
    -- Add admin role instead of customer
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Remove the pending invite
    DELETE FROM public.pending_admin_invites WHERE email = LOWER(NEW.email);
  ELSE
    -- Add default customer role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer');
  END IF;
  
  RETURN NEW;
END;
$$;