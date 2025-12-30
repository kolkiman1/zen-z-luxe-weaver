-- Create a table for site settings (SEO, tracking, social, etc.)
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site settings (needed for SEO meta tags on frontend)
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can insert site settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings" 
ON public.site_settings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default SEO settings
INSERT INTO public.site_settings (key, value) VALUES 
('seo', '{
  "siteName": "zen-z.store",
  "siteDescription": "Premium fashion and lifestyle products for the modern generation. Shop trendy clothing, accessories, and more.",
  "siteKeywords": "fashion, clothing, mens wear, womens wear, accessories, online shopping, bangladesh, trendy, streetwear",
  "ogImage": "/og-image.jpg",
  "twitterHandle": "@zenzstore"
}'::jsonb),
('tracking', '{
  "googleAnalyticsId": "",
  "facebookPixelId": "",
  "googleTagManagerId": "",
  "hotjarId": ""
}'::jsonb);