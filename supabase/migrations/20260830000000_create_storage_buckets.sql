/*
# Storage Buckets for Model Images and 3D Files

## Overview
Creates two Supabase Storage buckets:
1. `model-images` — Public bucket for model preview images and gallery images
2. `model-files` — Private bucket for downloadable 3D model files (STL, OBJ, FBX, etc.)

## New Buckets
1. `model-images`
   - Public bucket (anyone can read images without authentication)
   - Only authenticated users can upload
   - 10MB file size limit
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
2. `model-files`
   - Private bucket (only the uploader can read their own files)
   - Only authenticated users can upload
   - 500MB file size limit
   - Allowed MIME types: application/octet-stream, model/stl, model/obj, application/zip, and various 3D formats

## Security
- `model-images`: Public SELECT (anyone can view), authenticated INSERT/UPDATE/DELETE (owner only via storage policies)
- `model-files`: Owner-only SELECT/INSERT/UPDATE/DELETE (authenticated users, files scoped to their user ID folder)
- Storage policies use auth.uid() for ownership checks
*/

-- Create model-images bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'model-images',
  'model-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create model-files bucket (private, download-only after purchase)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'model-files',
  'model-files',
  false,
  524288000,
  ARRAY['application/octet-stream', 'model/stl', 'model/obj', 'application/zip', 'application/x-zip-compressed', 'application/x-7z-compressed', 'application/x-rar-compressed', 'application/x-tar', 'application/gzip', 'application/x-bzip2']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- model-images storage policies
-- ============================================================

-- Public read for model-images
DROP POLICY IF EXISTS "public_read_model_images" ON storage.objects;
CREATE POLICY "public_read_model_images" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'model-images');

-- Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "insert_own_model_images" ON storage.objects;
CREATE POLICY "insert_own_model_images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'model-images' AND auth.uid() = owner);

-- Users can update their own images
DROP POLICY IF EXISTS "update_own_model_images" ON storage.objects;
CREATE POLICY "update_own_model_images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'model-images' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'model-images' AND auth.uid() = owner);

-- Users can delete their own images
DROP POLICY IF EXISTS "delete_own_model_images" ON storage.objects;
CREATE POLICY "delete_own_model_images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'model-images' AND auth.uid() = owner);

-- ============================================================
-- model-files storage policies
-- ============================================================

-- Only owner can read their uploaded model files
DROP POLICY IF EXISTS "read_own_model_files" ON storage.objects;
CREATE POLICY "read_own_model_files" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'model-files' AND auth.uid() = owner);

-- Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "insert_own_model_files" ON storage.objects;
CREATE POLICY "insert_own_model_files" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'model-files' AND auth.uid() = owner);

-- Users can update their own model files
DROP POLICY IF EXISTS "update_own_model_files" ON storage.objects;
CREATE POLICY "update_own_model_files" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'model-files' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'model-files' AND auth.uid() = owner);

-- Users can delete their own model files
DROP POLICY IF EXISTS "delete_own_model_files" ON storage.objects;
CREATE POLICY "delete_own_model_files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'model-files' AND auth.uid() = owner);
