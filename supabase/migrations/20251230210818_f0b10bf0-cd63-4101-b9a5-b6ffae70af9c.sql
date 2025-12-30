-- Create security_events table for tracking security-related events
CREATE TABLE public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, -- 'failed_login', 'rate_limit_hit', 'suspicious_activity', 'unauthorized_access'
  user_id uuid,
  user_email text,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}',
  severity text NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  resolved boolean DEFAULT false,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage security events
CREATE POLICY "Admins can view security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update security events"
ON public.security_events
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (for edge functions)
CREATE POLICY "Service role can insert security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- Create admin_notification_settings table
CREATE TABLE public.admin_notification_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email_notifications boolean DEFAULT true,
  notify_on_admin_actions boolean DEFAULT true,
  notify_on_security_events boolean DEFAULT true,
  notify_on_critical_only boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage their own notification settings
CREATE POLICY "Admins can view their notification settings"
ON public.admin_notification_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert their notification settings"
ON public.admin_notification_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update their notification settings"
ON public.admin_notification_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

-- Service role can read all settings (for notification edge function)
CREATE POLICY "Service role can read all notification settings"
ON public.admin_notification_settings
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_notification_settings_updated_at
BEFORE UPDATE ON public.admin_notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_resolved ON public.security_events(resolved);