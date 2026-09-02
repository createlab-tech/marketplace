/*
# Create Lab Marketplace Schema

## Overview
Creates the database schema for Create Lab, a 3D model marketplace similar to CGTrader.

## New Tables
1. `categories` - Model categories (Characters, Vehicles, Architecture, etc.)
   - id, name, slug, icon, created_at
2. `sellers` - Public seller/artist profiles
   - id, name, slug, avatar_url, bio, rating, sales_count, joined_at
3. `models` - 3D model listings
   - id, title, slug, description, price, category_id, seller_id, image_url, gallery (text[]), file_formats (text[]), polygons, vertices, textures, rigged, animated, license_type, rating, review_count, download_count, is_free, created_at
4. `reviews` - User reviews on models
   - id, model_id, user_name, rating, comment, created_at
5. `favorites` - Authenticated user favorites (wishlist)
   - id, user_id, model_id, created_at
6. `orders` - Purchase records
   - id, user_id, total, status, created_at
7. `order_items` - Items within an order
   - id, order_id, model_id, model_title, price

## Security
- categories, sellers, models, reviews: public read (TO anon, authenticated), no public write
- favorites: owner-scoped CRUD (TO authenticated, auth.uid() = user_id)
- orders: owner-scoped SELECT + INSERT (TO authenticated)
- order_items: owner-scoped through orders (TO authenticated)
- All tables have RLS enabled

## Important Notes
1. Catalog data (categories, sellers, models, reviews) is intentionally public for browsing
2. User-specific data (favorites, orders) is owner-scoped via auth.uid()
3. Cart is handled client-side via localStorage, not persisted server-side
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'Box',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Sellers
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  rating numeric DEFAULT 0,
  sales_count integer DEFAULT 0,
  joined_at timestamptz DEFAULT now()
);
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_sellers" ON sellers;
CREATE POLICY "public_read_sellers" ON sellers FOR SELECT
  TO anon, authenticated USING (true);

-- Models
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  gallery text[] DEFAULT '{}',
  file_formats text[] DEFAULT '{}',
  polygons bigint DEFAULT 0,
  vertices bigint DEFAULT 0,
  textures boolean DEFAULT false,
  rigged boolean DEFAULT false,
  animated boolean DEFAULT false,
  license_type text DEFAULT 'Standard',
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  is_free boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_models" ON models;
CREATE POLICY "public_read_models" ON models FOR SELECT
  TO anon, authenticated USING (true);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

-- Favorites (owner-scoped)
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, model_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Orders (owner-scoped)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Order Items (owner-scoped through orders)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  model_id uuid,
  model_title text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_models_category ON models(category_id);
CREATE INDEX IF NOT EXISTS idx_models_seller ON models(seller_id);
CREATE INDEX IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_model ON reviews(model_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
==> Cloning from https://github.com/createlab-tech/marketplace
==> Checking out commit f45d26c9989b149da56d543d512ba8781b95ef48 in branch main
==> Downloaded 31MB in 6s. Extraction took 1s.
==> Installing dependencies with pnpm...
==> Using Node.js version 24.14.1 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
 ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with <ROOT>/package.json
Note that in CI environments this setting is true by default. If you still need to run install in such cases, use "pnpm install --no-frozen-lockfile"
  Failure reason:
  specifiers in the lockfile don't match specifiers in package.json:
* 2 dependencies were added: @supabase/server@^1.4.1, @supabase/ssr@^0.12.5
* 1 dependencies are mismatched:
  - @supabase/supabase-js (lockfile: ^2.57.4, manifest: ^2.112.4)==> Cloning from https://github.com/createlab-tech/marketplace
==> Checking out commit f45d26c9989b149da56d543d512ba8781b95ef48 in branch main
==> Downloaded 31MB in 6s. Extraction took 1s.
==> Installing dependencies with pnpm...
==> Using Node.js version 24.14.1 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
 ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with <ROOT>/package.json
Note that in CI environments this setting is true by default. If you still need to run install in such cases, use "pnpm install --no-frozen-lockfile"
  Failure reason:
  specifiers in the lockfile don't match specifiers in package.json:
* 2 dependencies were added: @supabase/server@^1.4.1, @supabase/ssr@^0.12.5
* 1 dependencies are mismatched:
  - @supabase/supabase-js (lockfile: ^2.57.4, manifest: ^2.112.4)==> Cloning from https://github.com/createlab-tech/marketplace
==> Checking out commit f45d26c9989b149da56d543d512ba8781b95ef48 in branch main
==> Downloaded 31MB in 6s. Extraction took 1s.
==> Installing dependencies with pnpm...
==> Using Node.js version 24.14.1 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
 ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with <ROOT>/package.json
Note that in CI environments this setting is true by default. If you still need to run install in such cases, use "pnpm install --no-frozen-lockfile"
  Failure reason:
  specifiers in the lockfile don't match specifiers in package.json:
* 2 dependencies were added: @supabase/server@^1.4.1, @supabase/ssr@^0.12.5
* 1 dependencies are mismatched:
  - @supabase/supabase-js (lockfile: ^2.57.4, manifest: ^2.112.4)==> Cloning from https://github.com/createlab-tech/marketplace
==> Checking out commit f45d26c9989b149da56d543d512ba8781b95ef48 in branch main
==> Downloaded 31MB in 6s. Extraction took 1s.
==> Installing dependencies with pnpm...
==> Using Node.js version 24.14.1 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
 ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with <ROOT>/package.json
Note that in CI environments this setting is true by default. If you still need to run install in such cases, use "pnpm install --no-frozen-lockfile"
  Failure reason:
  specifiers in the lockfile don't match specifiers in package.json:
* 2 dependencies were added: @supabase/server@^1.4.1, @supabase/ssr@^0.12.5
* 1 dependencies are mismatched:
  - @supabase/supabase-js (lockfile: ^2.57.4, manifest: ^2.112.4)==> Cloning from https://github.com/createlab-tech/marketplace
==> Checking out commit f45d26c9989b149da56d543d512ba8781b95ef48 in branch main
==> Downloaded 31MB in 6s. Extraction took 1s.
==> Installing dependencies with pnpm...
==> Using Node.js version 24.14.1 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
 ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with <ROOT>/package.json
Note that in CI environments this setting is true by default. If you still need to run install in such cases, use "pnpm install --no-frozen-lockfile"
  Failure reason:
  specifiers in the lockfile don't match specifiers in package.json:
* 2 dependencies were added: @supabase/server@^1.4.1, @supabase/ssr@^0.12.5
* 1 dependencies are mismatched:
  - @supabase/supabase-js (lockfile: ^2.57.4, manifest: ^2.112.4)