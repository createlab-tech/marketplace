import { useEffect, useState } from 'react';
import { Boxes, FolderTree, ShoppingBag, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Stats = {
  models: number;
  categories: number;
  sellers: number;
  orders: number;
};

const statCards = [
  { key: 'models' as const, label: 'Models', icon: Boxes, color: 'text-blue-600 bg-blue-50' },
  { key: 'categories' as const, label: 'Categories', icon: FolderTree, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'sellers' as const, label: 'Sellers', icon: Store, color: 'text-amber-600 bg-amber-50' },
  { key: 'orders' as const, label: 'Orders', icon: ShoppingBag, color: 'text-violet-600 bg-violet-50' },
];

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({ models: 0, categories: 0, sellers: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const [models, categories, sellers, orders] = await Promise.all([
        supabase.from('models').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('sellers').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        models: models.count ?? 0,
        categories: categories.count ?? 0,
        sellers: sellers.count ?? 0,
        orders: orders.count ?? 0,
      });
      setLoading(false);
    };

    void loadStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">A quick look at your marketplace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {loading && <span className="text-xs text-gray-400">Loading...</span>}
            </div>
            <p className="text-sm text-gray-500 mt-5">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats[key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900">Marketplace status</h2>
        <p className="text-sm text-gray-500 mt-2">
          {stats.models === 0 ? 'Add your first model to start building the catalog.' : `${stats.models} model${stats.models === 1 ? '' : 's'} currently listed in the catalog.`}
        </p>
      </div>
    </div>
  );
}
