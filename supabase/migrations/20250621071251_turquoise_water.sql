/*
  # Create Supabase Storage Bucket for Images

  1. Storage Setup
    - Create 'images' storage bucket
    - Set up proper permissions for authenticated users
    - Configure file size and type restrictions

  2. Security
    - Allow authenticated users to upload images
    - Allow public read access to images
    - Restrict file types to images only
    - Set maximum file size limits

  3. Policies
    - Upload policy for authenticated users
    - Public read access for all users
    - Delete policy for file owners
*/

-- Create the images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'uploads'
);

-- Policy: Allow public read access to all images
CREATE POLICY "Public read access for images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- Policy: Allow users to update their own uploaded images
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  auth.uid()::text = (metadata->>'uploadedBy')
)
WITH CHECK (
  bucket_id = 'images' AND
  auth.uid()::text = (metadata->>'uploadedBy')
);

-- Policy: Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  auth.uid()::text = (metadata->>'uploadedBy')
);

-- Add helpful comments
COMMENT ON POLICY "Authenticated users can upload images" ON storage.objects IS 'Allows authenticated users to upload images to the uploads folder';
COMMENT ON POLICY "Public read access for images" ON storage.objects IS 'Allows anyone to view images in the images bucket';
COMMENT ON POLICY "Users can update their own images" ON storage.objects IS 'Allows users to update metadata of images they uploaded';
COMMENT ON POLICY "Users can delete their own images" ON storage.objects IS 'Allows users to delete images they uploaded';