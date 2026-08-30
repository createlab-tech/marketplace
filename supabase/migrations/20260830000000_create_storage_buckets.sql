-- Storage buckets used by the seller upload flow.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('images', 'images', true),
  ('stl-files', 'stl-files', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE OR REPLACE FUNCTION public.user_has_purchased_model_file(p_file_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM models m
    JOIN order_items oi ON oi.model_id = m.id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.user_id = auth.uid()
      AND o.status = 'completed'
      AND m.file_url = p_file_name
  );
$$;

DROP POLICY IF EXISTS "public_read_images" ON storage.objects;
CREATE POLICY "public_read_images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'images');

DROP POLICY IF EXISTS "authenticated_upload_images" ON storage.objects;
CREATE POLICY "authenticated_upload_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "authenticated_update_images" ON storage.objects;
CREATE POLICY "authenticated_update_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "authenticated_delete_images" ON storage.objects;
CREATE POLICY "authenticated_delete_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images');

DROP POLICY IF EXISTS "authenticated_upload_stl_files" ON storage.objects;
CREATE POLICY "authenticated_upload_stl_files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'stl-files');

DROP POLICY IF EXISTS "authenticated_update_stl_files" ON storage.objects;
CREATE POLICY "authenticated_update_stl_files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'stl-files')
  WITH CHECK (bucket_id = 'stl-files');

DROP POLICY IF EXISTS "authenticated_delete_stl_files" ON storage.objects;
CREATE POLICY "authenticated_delete_stl_files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'stl-files');

DROP POLICY IF EXISTS "private_read_stl_files" ON storage.objects;
CREATE POLICY "private_read_stl_files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'stl-files' AND (
      EXISTS (
        SELECT 1
        FROM models m
        WHERE m.seller_id = auth.uid()
          AND m.file_url = storage.objects.name
      ) OR public.user_has_purchased_model_file(storage.objects.name)
    )
  );