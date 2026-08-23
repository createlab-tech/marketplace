/*
# Admin Panel Support: Profiles, Admin Role, and Catalog Write Policies

## Overview
This migration adds the infrastructure needed for a backend admin panel:
1. A `profiles` table linked to auth.users that stores an `is_admin` flag.
2. A `SECURITY DEFINER` helper function `is_admin()` that checks if the current
   user has admin privileges.
3. Admin-only INSERT/UPDATE/DELETE policies on the catalog tables (categories,
   sellers, models, reviews) so only admins can modify catalog data.
4. Admin-only SELECT on orders and order_items so the admin panel can view all
   orders.

## New Tables
1. `profiles`
   - `id` (uuid, PK, references auth.users) — one row per user
   - `email` (text) — denormalized for quick lookup/display
   - `is_admin` (boolean, default false) — admin flag
   - `created_at` (timestamptz)

## New Functions
1. `is_admin()` — SECURITY DEFINER, returns boolean.
2. `handle_new_user()` — trigger function to auto-create profile on signup.

## Security Changes
- `profiles`: RLS enabled. Users read own profile; admins read all. Only admins
  can update profiles. Column-level GRANT excludes `is_admin` from authenticated.
- `categories`, `sellers`, `models`, `reviews`: admin INSERT/UPDATE/DELETE policies.
- `orders`, `order_items`: admin SELECT policy.

## Important Notes
1. The `is_admin` column is never client-writable. Only an existing admin can
   promote another user.
2. To bootstrap the first admin, run:
   UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
3. The `is_admin()` function is SECURITY DEFINER with SET search_path = public.
*/

-- ============================================================
-- 1. is_admin() helper function (SECURITY DEFINER) — must exist before policies
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================================
-- 2. Profiles RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "select_all_profiles_admin" ON profiles;
CREATE POLICY "select_all_profiles_admin" ON profiles FOR SELECT
  TO authenticated USING (public.is_admin());

REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (email) ON profiles TO authenticated;

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_all_profiles_admin" ON profiles;
CREATE POLICY "update_all_profiles_admin" ON profiles FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- 3. Auto-create profile on signup (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. Admin write policies on catalog tables
-- ============================================================

-- Categories
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- Sellers
DROP POLICY IF EXISTS "admin_insert_sellers" ON sellers;
CREATE POLICY "admin_insert_sellers" ON sellers FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_sellers" ON sellers;
CREATE POLICY "admin_update_sellers" ON sellers FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_sellers" ON sellers;
CREATE POLICY "admin_delete_sellers" ON sellers FOR DELETE
  TO authenticated USING (public.is_admin());

-- Models
DROP POLICY IF EXISTS "admin_insert_models" ON models;
CREATE POLICY "admin_insert_models" ON models FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_models" ON models;
CREATE POLICY "admin_update_models" ON models FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_models" ON models;
CREATE POLICY "admin_delete_models" ON models FOR DELETE
  TO authenticated USING (public.is_admin());

-- Reviews
DROP POLICY IF EXISTS "admin_insert_reviews" ON reviews;
CREATE POLICY "admin_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- 5. Admin read access on orders
-- ============================================================
DROP POLICY IF EXISTS "admin_select_orders" ON orders;
CREATE POLICY "admin_select_orders" ON orders FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_select_order_items" ON order_items;
CREATE POLICY "admin_select_order_items" ON order_items FOR SELECT
  TO authenticated USING (public.is_admin());

-- ============================================================
-- 6. Index
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);