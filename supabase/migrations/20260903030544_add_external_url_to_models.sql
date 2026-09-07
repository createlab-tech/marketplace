/*
# Add External Store URL to Models

## Purpose
Allows sellers to list physical 3D models (e.g. 3D prints) that are sold on an
external storefront such as Etsy, eBay, or Shopify. Instead of uploading files
and processing payment through CreateLab, the listing shows an image and a
"Buy on Etsy" button that links out to the seller's external store.

## Changes
1. Modified Tables
   - `models`
     - New column `external_url` (text, nullable). When non-null, the listing
       is treated as an external/physical product: the "Add to Cart" button is
       replaced by an external "Buy on Store" link, and file upload is skipped
       during listing creation.
     - New column `external_store_name` (text, nullable). Optional label for
       the store name (e.g. "Etsy", "eBay") used for button text and badges.

## Security
- No policy changes. The new columns inherit the existing public-read RLS
  policy on `models` (`public_read_models`). Writes remain server-controlled
  via the existing seller/insert flow.

## Notes
1. Both columns are nullable so existing digital-only listings are unaffected.
2. No data is lost — this is an additive migration only.
*/

ALTER TABLE models
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS external_store_name text;
