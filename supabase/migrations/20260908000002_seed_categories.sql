-- Seed the built-in categories used by the marketplace upload flow.
INSERT INTO public.categories (name, slug, icon)
VALUES
  ('3D Printing', '3d-printing', 'Printer'),
  ('Art', 'art', 'Palette'),
  ('Fashion', 'fashion', 'Shirt'),
  ('Gadgets', 'gadgets', 'Smartphone'),
  ('Hobby', 'hobby', 'Puzzle'),
  ('Household', 'household', 'House'),
  ('Learning', 'learning', 'BookOpen'),
  ('Miniatures', 'miniatures', 'Blocks'),
  ('Models', 'models', 'Box'),
  ('Tools', 'tools', 'Wrench'),
  ('Toys & Games', 'toys-games', 'Gamepad2'),
  ('Misc', 'misc', 'Package')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    icon = EXCLUDED.icon;
