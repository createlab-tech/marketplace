export type SiteCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

const categoryImages: Record<string, string> = {
  '3d-printing': 'https://images.unsplash.com/photo-1633412802994-5c058f151b66?auto=format&fit=crop&w=640&q=80',
  art: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=640&q=80',
  fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=640&q=80',
  gadgets: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=640&q=80',
  hobby: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&w=640&q=80',
  household: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=640&q=80',
  learning: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=640&q=80',
  miniatures: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=640&q=80',
  models: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=640&q=80',
  tools: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=640&q=80',
  'toys-games': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=640&q=80',
  misc: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=640&q=80',
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

export const getCategoryImage = (slug: string | undefined) =>
  (slug && categoryImages[slug]) || categoryImages.misc;
