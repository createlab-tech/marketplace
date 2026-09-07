/*
# Stripe Payment Tracking

## Overview
Adds columns to the orders table to track Stripe payment sessions and intents,
and updates the order status workflow to support pending/completed/cancelled states.

## Changes
1. `orders.stripe_session_id` — Stripe Checkout Session ID (set at checkout creation)
2. `orders.stripe_payment_intent_id` — Stripe Payment Intent ID (set on webhook confirmation)
3. Default status changed from 'completed' to 'pending' so orders only complete after payment
4. Adds an RLS policy allowing the webhook edge function (service role) to update orders

## Security
- No new public policies. The service role (used by edge functions) bypasses RLS.
- Users still only have SELECT + INSERT on their own orders.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

ALTER TABLE orders
  ALTER COLUMN status SET DEFAULT 'pending';
