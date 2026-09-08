-- Allow authenticated sellers to create models they own.
DROP POLICY IF EXISTS "seller_insert_models" ON models;
CREATE POLICY "seller_insert_models" ON models
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM sellers
      WHERE sellers.id = models.seller_id
        AND sellers.user_id = (SELECT auth.uid())
    )
  );
