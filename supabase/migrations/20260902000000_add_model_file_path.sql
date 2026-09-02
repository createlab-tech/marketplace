ALTER TABLE public.models
  ADD COLUMN IF NOT EXISTS file_path text;

UPDATE public.models
SET file_path = file_url
WHERE file_path IS NULL
  AND file_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_models_file_path
  ON public.models(file_path);
