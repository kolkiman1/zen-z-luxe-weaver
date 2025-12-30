-- Create storage bucket for SEO images (OG images, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('seo-images', 'seo-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to SEO images
CREATE POLICY "SEO images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'seo-images');

-- Allow admins to upload SEO images
CREATE POLICY "Admins can upload SEO images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'seo-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update SEO images
CREATE POLICY "Admins can update SEO images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'seo-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete SEO images
CREATE POLICY "Admins can delete SEO images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'seo-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);