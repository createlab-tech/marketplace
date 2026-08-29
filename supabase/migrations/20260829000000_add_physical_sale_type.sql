ALTER TABLE models
  ADD COLUMN IF NOT EXISTS sale_type text NOT NULL DEFAULT 'digital',
  ADD COLUMN IF NOT EXISTS is_physical boolean NOT NULL DEFAULT false;

UPDATE models
SET sale_type = 'digital'
WHERE sale_type IS NULL;

UPDATE models
SET is_physical = (sale_type = 'physical')
WHERE is_physical IS NULL;

ALTER TABLE models
  ADD CONSTRAINT models_sale_type_check
  CHECK (sale_type IN ('digital', 'physical'))
  NOT VALID;

CREATE INDEX IF NOT EXISTS idx_models_sale_type ON models(sale_type);
