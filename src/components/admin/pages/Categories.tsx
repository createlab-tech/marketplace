import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import { SITE_CATEGORIES } from '@/data/categories';

const fallbackCategories: Category[] = SITE_CATEGORIES.map((category) => ({
  ...category,
  created_at: new Date().toISOString(),
})) as Category[];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [catRes, modelRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('models').select('category_id'),
      ]);
      const nextCategories = (catRes.data && catRes.data.length > 0 ? catRes.data : fallbackCategories);
      setCategories(nextCategories);
      const countMap: Record<string, number> = {};
      (modelRes.data ?? []).forEach((m) => {
        if (m.category_id) countMap[m.category_id] = (countMap[m.category_id] ?? 0) + 1;
      });
      setCounts(countMap);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">All Categories</h1>
        <p className="text-gray-500 mt-1">Browse 3D models by category</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="card p-6 hover:border-primary-300 hover:bg-primary-50/30 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {cat.icon || '📦'}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{counts[cat.id] ?? 0} models</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
