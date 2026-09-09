import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modelCounts, setModelCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const [{ data: categoryData }, { data: modelData }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('models').select('category_id'),
      ]);
      const counts: Record<string, number> = {};
      (modelData ?? []).forEach(({ category_id }) => { if (category_id) counts[category_id] = (counts[category_id] ?? 0) + 1; });
      setCategories((categoryData as Category[] | null) ?? []);
      setModelCounts(counts);
      setLoading(false);
    };
    void loadCategories();
  }, []);

  return <div className="p-6 max-w-5xl mx-auto"><div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Categories</h1><p className="text-gray-500 mt-1">Catalog categories and their model counts.</p></div><div className="bg-white border border-gray-200 rounded-xl overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-5 py-3 font-semibold text-gray-600">Category</th><th className="px-5 py-3 font-semibold text-gray-600">Slug</th><th className="px-5 py-3 font-semibold text-gray-600">Models</th></tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-400">Loading categories...</td></tr> : categories.length === 0 ? <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-400">No categories have been added yet.</td></tr> : categories.map((category) => <tr key={category.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-medium text-gray-900">{category.icon} {category.name}</td><td className="px-5 py-4 text-gray-500">{category.slug}</td><td className="px-5 py-4 text-gray-600">{modelCounts[category.id] ?? 0}</td></tr>)}</tbody></table></div></div>;
}
