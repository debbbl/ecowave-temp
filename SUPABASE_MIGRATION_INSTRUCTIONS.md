# Fix Storage Bucket Error - Manual Migration Required

## Problem
The application is failing to upload images because the 'images' storage bucket doesn't exist in your Supabase project.

## Solution
You need to manually execute the migration SQL in your Supabase project's SQL Editor.

### Steps to Fix:

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Execute the Migration SQL**
   Copy and paste the following SQL code into the SQL Editor and run it:

```sql
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
```

4. **Click "Run" to execute the SQL**

5. **Verify the bucket was created**
   - Go to "Storage" in the left sidebar
   - You should see an "images" bucket listed

### After completing these steps:
- The image upload functionality should work properly
- Users will be able to upload images to the events section
- The storage bucket will have proper security policies in place

### Alternative Method:
If you prefer, you can also create the bucket manually through the Supabase Dashboard:
1. Go to Storage → Create a new bucket
2. Name it "images"
3. Make it public
4. Set file size limit to 10MB
5. Then run only the policy creation parts of the SQL above

## Important Notes:
- This migration creates a public storage bucket for images
- File uploads are restricted to authenticated users
- Maximum file size is 10MB
- Only image file types are allowed (JPEG, PNG, GIF, WebP)
- The bucket has proper Row Level Security policies