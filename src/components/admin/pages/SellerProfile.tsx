import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Download, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Seller, Model } from '@/lib/types';
import ModelCard from '@/components/ModelCard';

export default function SellerProfile() {
  const { slug } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: s } = await supabase.from('sellers').select('*').eq('slug', slug).maybeSingle();
      setSeller(s);
      if (s) {
        const { data: m } = await supabase.from('models').select('*, categories(*), sellers(*)').eq('seller_id', s.id).order('rating', { ascending: false });
        setModels(m ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-2xl mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Seller not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Seller header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-800 to-primary-600 p-8 mb-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <img src={seller.avatar_url ?? ''} alt={seller.name} className="w-24 h-24 rounded-full object-cover border-4 border-white/20" />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{seller.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-primary-100 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
                <span>{seller.rating.toFixed(1)} rating</span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                <span>{seller.sales_count.toLocaleString()} sales</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(seller.joined_at).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{models.length} models</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {seller.bio && (
        <div className="mb-8 p-5 rounded-xl border border-gray-200 bg-white">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{seller.bio}</p>
        </div>
      )}

      {/* Models */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Models by {seller.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {models.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>
    </div>
  );
}
