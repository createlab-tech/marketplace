import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Model } from '@/lib/types';
import ModelCard from '@/components/ModelCard';

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch = async () => {
      const { data: favs } = await supabase.from('favorites').select('model_id').eq('user_id', user.id);
      if (favs && favs.length > 0) {
        const ids = favs.map((f) => f.model_id);
        const { data: models } = await supabase.from('models').select('*, categories(*), sellers(*)').in('id', ids);
        setFavorites(models ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Sign in to view your favorites</h1>
        <Link to="/signin" className="btn-primary mt-6 inline-flex">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
      <p className="text-gray-500 mb-6">{favorites.length} saved {favorites.length === 1 ? 'model' : 'models'}</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">You haven't saved any favorites yet.</p>
          <Link to="/shop" className="btn-primary mt-4 inline-flex">Browse Models</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {favorites.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      )}
    </div>
  );
}
