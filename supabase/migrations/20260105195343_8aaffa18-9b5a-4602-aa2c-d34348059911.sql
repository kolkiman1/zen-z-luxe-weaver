-- Expand public read access for storefront configuration stored in site_settings.
-- This fixes “admin changes not visible on other devices” when visitors are not logged in.

BEGIN;

-- site_settings already has RLS enabled in this project; keep it that way.
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Replace the existing public-read policy with one that includes storefront layout keys.
DROP POLICY IF EXISTS "Anyone can view public site settings" ON public.site_settings;

CREATE POLICY "Anyone can view public site settings"
ON public.site_settings
FOR SELECT
TO public
USING (
  key = ANY (
    ARRAY[
      -- existing public keys
      'site_name',
      'site_logo',
      'theme',
      'announcement',
      'social_links',
      'contact_info',

      -- storefront layout + content keys used by the public site
      'section-media',
      'section-content',
      'section-elements',
      'section-order',
      'category-banners',
      'announcement-bar',
      'product-collections',
      'hero_content',
      'video-showcase',

      -- safe-to-expose config (already public in practice)
      'seo',
      'tracking'
    ]::text[]
  )
);

COMMIT;