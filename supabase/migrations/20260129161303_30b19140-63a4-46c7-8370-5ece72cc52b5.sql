-- Tighten service-role insert policies to satisfy linter (avoid WITH CHECK (true))

-- email_logs: replace service insert policy
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_logs;
CREATE POLICY "Service role can insert email logs"
ON public.email_logs
FOR INSERT
TO service_role
WITH CHECK (auth.role() = 'service_role');

-- security_events: replace service insert policy
DROP POLICY IF EXISTS "Service role can insert security events" ON public.security_events;
CREATE POLICY "Service role can insert security events"
ON public.security_events
FOR INSERT
TO service_role
WITH CHECK (auth.role() = 'service_role');
