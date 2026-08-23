import { Link } from 'react-router-dom';
import { Star, Download, Heart, ShoppingCart } from 'lucide-react';
import type { Model } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function ModelCard({ model }: { model: Model }) {
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const [favLoading, setFavLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const checkFav = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('model_id', model.id)
      .maybeSingle();
    setIsFav(!!data);
  };
  useEffect(() => { checkFav(); }, [user, model.id]);

  const toggleFavorite = async () => {
    if (!user) return;
    setFavLoading(true);
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('model_id', model.id);
      setIsFav(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, model_id: model.id });
      setIsFav(true);
    }
    setFavLoading(false);
  };

  const inCart = isInCart(model.id);

  return (
    <div className="card group overflow-hidden flex flex-col">
      <Link to={`/model/${model.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={model.image_url}
          alt={model.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {model.is_free && (
          <span className="absolute top-3 left-3 badge bg-success-500 text-white">FREE</span>
        )}
        {model.rigged && (
          <span className="absolute top-3 right-3 badge bg-gray-900/80 text-white">Rigged</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-sm font-medium">View Details</span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/model/${model.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
          {model.title}
        </Link>
        {model.sellers && (
          <Link to={`/seller/${model.sellers.slug}`} className="text-xs text-gray-500 hover:text-primary-600 mt-1">
            by {model.sellers.name}
          </Link>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-accent-400 text-accent-400" />
            <span>{model.rating.toFixed(1)}</span>
            <span>({model.review_count})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            <span>{model.download_count.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 gap-2">
          <div>
            {model.is_free ? (
              <span className="text-lg font-bold text-success-600">Free</span>
            ) : (
              <span className="text-lg font-bold text-gray-900">${model.price.toFixed(2)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {user && (
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className="p-2 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-gray-500 hover:text-primary-600"
                aria-label="Toggle favorite"
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-error-500 text-error-500' : ''}`} />
              </button>
            )}
            {!inCart && (
              <button
                onClick={() => addToCart({ modelId: model.id, title: model.title, price: model.price, image_url: model.image_url, slug: model.slug })}
                className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
            {inCart && (
              <span className="px-3 py-2 rounded-lg bg-success-50 text-success-700 text-xs font-semibold">
                In Cart
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}