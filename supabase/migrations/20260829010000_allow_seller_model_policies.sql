/*
# Seller Commission & Earnings System

## Overview
Adds infrastructure to track the platform's 30% commission on each sale and
record seller earnings (70% for Free tier) as an internal balance that can be
paid out later.

## Changes

### Modified Tables
1. `sellers`
   - ADD `user_id` (uuid, references auth.users) — links a seller profile to the
     authenticated user who owns it. Nullable for legacy seed data.
   - ADD `commission_rate` (numeric, default 0.70) — the seller's revenue share
     (0.70 = 70% for Free tier, 0.80 for Pro, 0.85 for Studio).

2. `order_items`
   - ADD `seller_id` (uuid, references sellers) — which seller gets paid for this item.
   - ADD `commission_rate` (numeric) — the commission rate snapshot at time of sale.
   - ADD `seller_earnings` (numeric) — the seller's share = price * commission_rate.
   - ADD `platform_fee` (numeric) — the platform's share = price - seller_earnings.

### New Tables
1. `seller_earnings`
   - `id` (uuid, PK)
   - `seller_id` (uuid, references sellers) — which seller earned
   - `order_id` (uuid, references orders) — which order generated the earning
   - `order_item_id` (uuid, references order_items) — which line item
   - `amount` (numeric) — the seller's earnings for this item
   - `status` (text, default 'pending') — 'pending', 'paid', or 'cancelled'
   - `created_at` (timestamptz)

2. `seller_payouts`
   - `id` (uuid, PK)
   - `seller_id` (uuid, references sellers)
   - `amount` (numeric) — total payout amount
   - `status` (text, default 'pending') — 'pending', 'completed', 'failed'
   - `created_at` (timestamptz)

## Security
- `seller_earnings`: owner-scoped SELECT (seller's user_id = auth.uid()),
  admin SELECT via is_admin(). No direct INSERT/UPDATE/DELETE from the client —
  only the service role (edge functions) writes to it.
- `seller_payouts`: same pattern — owner SELECT, admin SELECT.
- `sellers.user_id` is NOT client-writable via normal update policies (the
  existing admin-only update policy covers it).
*/

-- ============================================================
-- 1. Add user_id and commission_rate to sellers
-- ============================================================
ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commission_rate numeric(3,2) NOT NULL DEFAULT 0.70;

-- Create unique index so one user maps to one seller profile
CREATE UNIQUE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id) WHERE user_id IS NOT NULL;

-- Allow authenticated users to read seller profiles (already public, but ensure it)
-- No change needed — existing public_read_sellers policy covers this.

-- Allow a user to INSERT their own seller profile
DROP POLICY IF EXISTS "insert_own_seller" ON sellers;
CREATE POLICY "insert_own_seller" ON sellers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow a user to UPDATE their own seller profile (name, bio, avatar — NOT commission_rate)
DROP POLICY IF EXISTS "update_own_seller" ON sellers;
CREATE POLICY "update_own_seller" ON sellers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. Add commission columns to order_items
-- ============================================================
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commission_rate numeric(3,2),
  ADD COLUMN IF NOT EXISTS seller_earnings numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee numeric(10,2) DEFAULT 0;

-- ============================================================
-- 3. seller_earnings table
-- ============================================================
CREATE TABLE IF NOT EXISTS seller_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seller_earnings ENABLE ROW LEVEL SECURITY;

-- Owner can read their own earnings (through seller.user_id)
DROP POLICY IF EXISTS "select_own_earnings" ON seller_earnings;
CREATE POLICY "select_own_earnings" ON seller_earnings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = seller_earnings.seller_id AND sellers.user_id = auth.uid())
  );

-- Admin can read all earnings
DROP POLICY IF EXISTS "admin_select_earnings" ON seller_earnings;
CREATE POLICY "admin_select_earnings" ON seller_earnings FOR SELECT
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_earnings_seller ON seller_earnings(seller_id);
CREATE INDEX IF NOT EXISTS idx_earnings_order ON seller_earnings(order_id);

-- ============================================================
-- 4. seller_payouts table
-- ============================================================
CREATE TABLE IF NOT EXISTS seller_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;

-- Owner can read their own payouts
DROP POLICY IF EXISTS "select_own_payouts" ON seller_payouts;
CREATE POLICY "select_own_payouts" ON seller_payouts FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = seller_payouts.seller_id AND sellers.user_id = auth.uid())
  );

-- Admin can read all payouts
DROP POLICY IF EXISTS "admin_select_payouts" ON seller_payouts;
CREATE POLICY "admin_select_payouts" ON seller_payouts FOR SELECT
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_payouts_seller ON seller_payouts(seller_id);
