export type SiteCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export const SITE_CATEGORIES: SiteCategory[] = [
  { id: '3d-printing', name: '3D Printing', slug: '3d-printing', icon: '🖨️' },
  { id: 'art', name: 'Art', slug: 'art', icon: '🎨' },
  { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: '👗' },
  { id: 'gadgets', name: 'Gadgets', slug: 'gadgets', icon: '📱' },
  { id: 'hobby', name: 'Hobby', slug: 'hobby', icon: '🧩' },
  { id: 'household', name: 'Household', slug: 'household', icon: '🏠' },
  { id: 'learning', name: 'Learning', slug: 'learning', icon: '📚' },
  { id: 'miniatures', name: 'Miniatures', slug: 'miniatures', icon: '🧱' },
  { id: 'models', name: 'Models', slug: 'models', icon: '🧊' },
  { id: 'tools', name: 'Tools', slug: 'tools', icon: '🛠️' },
  { id: 'toys-games', name: 'Toys & Games', slug: 'toys-games', icon: '🎲' },
  { id: 'misc', name: 'Misc', slug: 'misc', icon: '📦' },
];

export const getCategoryBySlug = (slug: string | undefined) =>
  SITE_CATEGORIES.find((category) => category.slug === slug);

export const getCategoryByName = (name: string | undefined) =>
  SITE_CATEGORIES.find((category) => category.name === name);
