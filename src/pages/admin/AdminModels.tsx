import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Model } from '@/lib/types';

export default function AdminModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const { data, error: queryError } = await supabase
        .from('models')
        .select('*, categories(name), sellers(name)')
        .order('created_at', { ascending: false });
      if (queryError) setError(queryError.message);
      setModels((data as Model[] | null) ?? []);
      setLoading(false);
    };
    void loadModels();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Models</h1><p className="text-gray-500 mt-1">Manage marketplace listings.</p></div>
        <span className="text-sm text-gray-500">{models.length} total</span>
      </div>
      {error && <p className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">Unable to load models: {error}</p>}
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm"><thead className="bg-gray-50 border-b border-gray-200"><tr>
          <th className="px-5 py-3 font-semibold text-gray-600">Model</th><th className="px-5 py-3 font-semibold text-gray-600">Category</th><th className="px-5 py-3 font-semibold text-gray-600">Seller</th><th className="px-5 py-3 font-semibold text-gray-600">Price</th><th className="px-5 py-3 font-semibold text-gray-600">Added</th>
        </tr></thead><tbody className="divide-y divide-gray-100">
          {loading ? <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Loading models...</td></tr> : models.length === 0 ? <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No models have been added yet.</td></tr> : models.map((model) => {
            const category = model.categories as { name: string } | undefined;
            const seller = model.sellers as { name: string } | undefined;
            return <tr key={model.id} className="hover:bg-gray-50"><td className="px-5 py-4"><Link to={`/model/${model.slug}`} className="font-medium text-gray-900 hover:text-primary-600">{model.title}</Link></td><td className="px-5 py-4 text-gray-600">{category?.name ?? 'Uncategorized'}</td><td className="px-5 py-4 text-gray-600">{seller?.name ?? 'No seller'}</td><td className="px-5 py-4 text-gray-600">{model.is_free ? 'Free' : `$${Number(model.price).toFixed(2)}`}</td><td className="px-5 py-4 text-gray-500">{new Date(model.created_at).toLocaleDateString()}</td></tr>;
          })}
        </tbody></table>
      </div>
    </div>
  );
}
