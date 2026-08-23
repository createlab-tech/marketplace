import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Model, Category } from '@/lib/types';
import ModelCard from '@/components/ModelCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'relevance';
  const categoryFilter = searchParams.get('category') ?? '';
  const priceFilter = searchParams.get('price') ?? '';
  const formatFilter = searchParams.get('format') ?? '';

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data ?? []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      let dbQuery = supabase.from('models').select('*, categories(*), sellers(*)');

      if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      if (categoryFilter) {
        dbQuery = dbQuery.eq('categories.slug', categoryFilter);
      }
      if (priceFilter === 'free') {
        dbQuery = dbQuery.eq('is_free', true);
      } else if (priceFilter === '0-50') {
        dbQuery = dbQuery.lt('price', 50).eq('is_free', false);
      } else if (priceFilter === '50-100') {
        dbQuery = dbQuery.gte('price', 50).lt('price', 100);
      } else if (priceFilter === '100+') {
        dbQuery = dbQuery.gte('price', 100);
      }
      if (formatFilter) {
        dbQuery = dbQuery.contains('file_formats', [formatFilter]);
      }

      if (sort === 'rating') dbQuery = dbQuery.order('rating', { ascending: false });
      else if (sort === 'price-low') dbQuery = dbQuery.order('price', { ascending: true });
      else if (sort === 'price-high') dbQuery = dbQuery.order('price', { ascending: false });
      else if (sort === 'downloads') dbQuery = dbQuery.order('download_count', { ascending: false });
      else if (sort === 'free') { dbQuery = dbQuery.eq('is_free', true).order('download_count', { ascending: false }); }
      else dbQuery = dbQuery.order('created_at', { ascending: false });

      const { data } = await dbQuery;
      setModels(data ?? []);
      setLoading(false);
    };
    fetchModels();
  }, [query, sort, categoryFilter, priceFilter, formatFilter]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = categoryFilter || priceFilter || formatFilter;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {query ? `Results for "${query}"` : 'Browse 3D Models'}
        </h1>
        <p className="text-gray-500 mt-1">
          {models.length} {models.length === 1 ? 'model' : 'models'} found
        </p>
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        <div className="hidden lg:block" />
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:border-primary-500"
          >
            <option value="relevance">Newest First</option>
            <option value="rating">Top Rated</option>
            <option value="downloads">Most Downloaded</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="free">Free Only</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <aside className={`${
          showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
        } lg:sticky lg:top-20 lg:block lg:w-64 lg:h-fit shrink-0`}>
          {showFilters && (
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                    !categoryFilter ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                      categoryFilter === cat.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Price</h3>
              <div className="space-y-1.5">
                {[
                  { label: 'Any Price', value: '' },
                  { label: 'Free Only', value: 'free' },
                  { label: 'Under $50', value: '0-50' },
                  { label: '$50 - $100', value: '50-100' },
                  { label: '$100+', value: '100+' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam('price', opt.value)}
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                      priceFilter === opt.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">File Format</h3>
              <div className="space-y-1.5">
                {['FBX', 'OBJ', 'BLEND', 'ZTL', 'STL', 'GLB', '3DS'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => updateParam('format', formatFilter === fmt ? '' : fmt)}
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                      formatFilter === fmt ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-error-600 font-medium hover:text-error-700">
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Model grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No models found matching your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-primary-600 font-medium hover:text-primary-700">
                Clear filters and try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {models.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
