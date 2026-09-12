-- Store R2 object metadata separately from external storefront URLs.
ALTER TABLE models
  ADD COLUMN IF NOT EXISTS model_file_key text,
  ADD COLUMN IF NOT EXISTS model_file_name text,
  ADD COLUMN IF NOT EXISTS model_file_size bigint,
  ADD COLUMN IF NOT EXISTS model_file_content_type text;

ALTER TABLE models
  ADD CONSTRAINT models_model_file_size_non_negative
  CHECK (model_file_size IS NULL OR model_file_size > 0);

COMMENT ON COLUMN models.model_file_key IS 'Private Cloudflare R2 object key for the downloadable model file.';
COMMENT ON COLUMN models.model_file_name IS 'Original filename shown to the buyer when downloading the model.';
COMMENT ON COLUMN models.model_file_size IS 'Verified model file size in bytes from R2.';
COMMENT ON COLUMN models.model_file_content_type IS 'Verified model file content type from R2.';
