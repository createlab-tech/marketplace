import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Seller } from '@/lib/types';

export default function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const loadSellers = async () => { const { data } = await supabase.from('sellers').select('*').order('joined_at', { ascending: false }); setSellers((data as Seller[] | null) ?? []); setLoading(false); }; void loadSellers(); }, []);
  return <div className="p-6 max-w-6xl mx-auto"><div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Sellers</h1><p className="text-gray-500 mt-1">Creators in your marketplace.</p></div><div className="bg-white border border-gray-200 rounded-xl overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-5 py-3 font-semibold text-gray-600">Seller</th><th className="px-5 py-3 font-semibold text-gray-600">Slug</th><th className="px-5 py-3 font-semibold text-gray-600">Rating</th><th className="px-5 py-3 font-semibold text-gray-600">Sales</th></tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Loading sellers...</td></tr> : sellers.length === 0 ? <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No sellers have been added yet.</td></tr> : sellers.map((seller) => <tr key={seller.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-medium text-gray-900">{seller.name}</td><td className="px-5 py-4 text-gray-500">{seller.slug}</td><td className="px-5 py-4 text-gray-600">{Number(seller.rating).toFixed(1)}</td><td className="px-5 py-4 text-gray-600">{seller.sales_count}</td></tr>)}</tbody></table></div></div>;
}
