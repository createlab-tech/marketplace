ALTER TABLE models
  ADD COLUMN IF NOT EXISTS sale_type text NOT NULL DEFAULT 'digital',
  ADD COLUMN IF NOT EXISTS is_physical boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_details text;

UPDATE models
SET sale_type = 'digital'
WHERE sale_type IS NULL;

UPDATE models
SET is_physical = (sale_type = 'physical')
WHERE is_physical IS NULL;

UPDATE models
SET shipping_cost = 0
WHERE shipping_cost IS NULL;

ALTER TABLE models
  ADD CONSTRAINT models_sale_type_check
  CHECK (sale_type IN ('digital', 'physical'))
  NOT VALID;

CREATE INDEX IF NOT EXISTS idx_models_sale_type ON models(sale_type);
CREATE INDEX IF NOT EXISTS idx_models_is_physical ON models(is_physical);
