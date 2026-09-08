-- Add physical and digital listing fields used by the marketplace upload flow.
ALTER TABLE public.models
  ADD COLUMN IF NOT EXISTS sale_type text NOT NULL DEFAULT 'digital',
  ADD COLUMN IF NOT EXISTS is_physical boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_details text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'models_sale_type_check'
      AND conrelid = 'public.models'::regclass
  ) THEN
    ALTER TABLE public.models
      ADD CONSTRAINT models_sale_type_check
      CHECK (sale_type IN ('digital', 'physical'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'models_shipping_cost_check'
      AND conrelid = 'public.models'::regclass
  ) THEN
    ALTER TABLE public.models
      ADD CONSTRAINT models_shipping_cost_check
      CHECK (shipping_cost >= 0);
  END IF;
END $$;
