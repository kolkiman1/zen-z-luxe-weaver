-- Enable realtime payloads for site_settings updates
ALTER TABLE public.site_settings REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure updated_at is always maintained server-side
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
