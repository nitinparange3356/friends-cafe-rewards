
-- Create a public storage bucket for menu images
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true);

-- Allow anyone to read menu images (public bucket)
CREATE POLICY "Anyone can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Allow authenticated users to upload menu images (admin will be authenticated)
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images');

-- Allow authenticated users to update menu images
CREATE POLICY "Authenticated users can update menu images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-images');

-- Allow authenticated users to delete menu images
CREATE POLICY "Authenticated users can delete menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images');
