-- Allow authenticated sellers to create and manage their own listings.
-- Keep admin access intact for catalog management.

DROP POLICY IF EXISTS "authenticated_insert_own_models" ON models;
CREATE POLICY "authenticated_insert_own_models" ON models
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "authenticated_update_own_models" ON models;
CREATE POLICY "authenticated_update_own_models" ON models
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "authenticated_delete_own_models" ON models;
CREATE POLICY "authenticated_delete_own_models" ON models
  FOR DELETE TO authenticated
  USING (auth.uid() = seller_id);
