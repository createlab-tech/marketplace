-- Keep existing marketplace storage buckets aligned with the upload flow.
UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
WHERE id = 'model-images';

UPDATE storage.buckets
SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY[
    'application/octet-stream',
    'model/stl',
    'model/obj',
    'model/gltf-binary',
    'model/gltf+json',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-bzip2'
  ]
WHERE id = 'model-files';