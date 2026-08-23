import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Download, Heart, ShoppingCart, Check, ArrowLeft, Shield, FileBox, Box, Eye, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Model, Review } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import ModelCard from '@/components/ModelCard';

export default function ModelDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const [model, setModel] = useState<Model | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchModel = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('models')
        .select('*, categories(*), sellers(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setModel(data);
        setActiveImage(0);

        const [reviewsRes, relatedRes] = await Promise.all([
          supabase.from('reviews').select('*').eq('model_id', data.id).order('created_at', { ascending: false }),
          supabase.from('models').select('*, categories(*), sellers(*)')
            .eq('category_id', data.category_id ?? '')
            .neq('id', data.id)
            .limit(4),
        ]);
        setReviews(reviewsRes.data ?? []);
        setRelated(relatedRes.data ?? []);

        if (user) {
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('model_id', data.id)
            .maybeSingle();
          setIsFav(!!favData);
        }
      }
      setLoading(false);
    };
    fetchModel();
  }, [slug, user]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!model) return;
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

  const submitReview = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!model) return;
    if (!newReview.trim()) {
      setReviewError('Please write a comment.');
      return;
    }
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        model_id: model.id,
        user_name: user.email ?? 'Anonymous',
        rating: newRating,
        comment: newReview.trim(),
      })
      .select('*')
      .single();

    if (error) {
      setReviewError(error.message);
      return;
    }

    setReviews([data, ...reviews]);
    setNewReview('');
    setNewRating(5);
    setReviewError('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Model not found</h1>
        <p className="text-gray-500 mt-2">The model you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Back to Browse</Link>
      </div>
    );
  }

  const gallery = model.gallery?.length ? model.gallery : [model.image_url];
  const inCart = isInCart(model.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Browse
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            <img src={gallery[activeImage]} alt={model.title} className="w-full h-full object-cover" />
            {model.is_free && (
              <span className="absolute top-4 left-4 badge bg-success-500 text-white text-sm px-3 py-1">FREE</span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {model.categories && (
              <Link to={`/category/${model.categories.slug}`} className="badge bg-primary-50 text-primary-700">
                {model.categories.name}
              </Link>
            )}
            {model.rigged && <span className="badge bg-accent-50 text-accent-700">Rigged</span>}
            {model.animated && <span className="badge bg-success-50 text-success-700">Animated</span>}
            {model.textures && <span className="badge bg-gray-100 text-gray-700">PBR Textures</span>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{model.title}</h1>

          {model.sellers && (
            <Link to={`/seller/${model.sellers.slug}`} className="inline-flex items-center gap-2 mt-3 group">
              <img src={model.sellers.avatar_url ?? ''} alt="" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{model.sellers.name}</p>
                <p className="text-xs text-gray-500">★ {model.sellers.rating.toFixed(1)} · {model.sellers.sales_count.toLocaleString()} sales</p>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
              <span className="font-semibold text-gray-900">{model.rating.toFixed(1)}</span>
              <span className="text-gray-500">({model.review_count} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Download className="w-4 h-4" />
              {model.download_count.toLocaleString()} downloads
            </div>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-baseline gap-2">
              {model.is_free ? (
                <span className="text-3xl font-bold text-success-600">Free</span>
              ) : (
                <span className="text-3xl font-bold text-gray-900">${model.price.toFixed(2)}</span>
              )}
              <span className="text-sm text-gray-500">· {model.license_type} License</span>
            </div>

            <div className="flex gap-3 mt-4">
              {!inCart ? (
                <button
                  onClick={() => addToCart({ modelId: model.id, title: model.title, price: model.price, image_url: model.image_url, slug: model.slug })}
                  className="btn-primary flex-1"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              ) : (
                <Link to="/cart" className="btn-secondary flex-1">
                  <Check className="w-4 h-4 text-success-600" /> View in Cart
                </Link>
              )}
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className="p-2.5 rounded-lg border border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors text-gray-500 hover:text-primary-600"
                aria-label="Toggle favorite"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-error-500 text-error-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {[
              { icon: Box, label: 'Polygons', value: model.polygons.toLocaleString() },
              { icon: Eye, label: 'Vertices', value: model.vertices.toLocaleString() },
              { icon: FileBox, label: 'Formats', value: model.file_formats.join(', ') },
              { icon: Shield, label: 'License', value: model.license_type },
            ].map((spec, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                <spec.icon className="w-5 h-5 text-primary-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{spec.label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 leading-relaxed">{model.description}</p>
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reviews ({reviews.length})
            </h2>

            {user && (
              <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Write a Review</h3>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-0.5"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-accent-400 text-accent-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Share your thoughts about this model..."
                  className="input mb-2"
                  rows={3}
                />
                {reviewError && <p className="text-sm text-error-600 mb-2">{reviewError}</p>}
                <button onClick={submitReview} className="btn-primary">Submit Review</button>
              </div>
            )}

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                          {review.user_name[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-gray-900">{review.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-accent-400 text-accent-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="p-5 rounded-xl border border-gray-200 sticky top-20">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Model Details</h3>
            <dl className="space-y-2 text-sm">
              {[
                ['Category', model.categories?.name ?? 'N/A'],
                ['File Formats', model.file_formats.join(', ')],
                ['Polygons', model.polygons.toLocaleString()],
                ['Vertices', model.vertices.toLocaleString()],
                ['Textures', model.textures ? 'Yes' : 'No'],
                ['Rigged', model.rigged ? 'Yes' : 'No'],
                ['Animated', model.animated ? 'Yes' : 'No'],
                ['License', model.license_type],
                ['Published', new Date(model.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-gray-500 shrink-0">{label}</dt>
                  <dd className="text-gray-900 font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Related Models</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((m) => (
              <ModelCard key={m.id} model={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}