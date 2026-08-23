import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Model, Category as CategoryType } from '@/lib/types';
import ModelCard from '@/components/ModelCard';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('relevance');

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
      setCategory(cat);

      if (cat) {
        let q = supabase.from('models').select('*, categories(*), sellers(*)').eq('category_id', cat.id);
        if (sort === 'rating') q = q.order('rating', { ascending: false });
        else if (sort === 'price-low') q = q.order('price', { ascending: true });
        else if (sort === 'price-high') q = q.order('price', { ascending: false });
        else if (sort === 'downloads') q = q.order('download_count', { ascending: false });
        else q = q.order('created_at', { ascending: false });

        const { data } = await q;
        setModels(data ?? []);
      }
      setLoading(false);
    };
    fetchCategory();
  }, [slug, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/categories" className="hover:text-primary-600">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{category?.name ?? '...'}</span>
      </nav>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category?.name ?? 'Category'}</h1>
          <p className="text-gray-500 mt-1">{models.length} models available</p>
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:border-primary-500"
          >
            <option value="relevance">Newest First</option>
            <option value="rating">Top Rated</option>
            <option value="downloads">Most Downloaded</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No models in this category yet.</p>
          <Link to="/shop" className="mt-4 inline-flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700">
            Browse all models <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {models.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      )}
    </div>
  );
}