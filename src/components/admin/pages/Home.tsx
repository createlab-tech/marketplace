import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Download, Shield, Star, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Model, Category } from '@/lib/types';
import { SITE_CATEGORIES } from '@/data/categories';
import ModelCard from '@/components/ModelCard';
import { formatSellerPayout } from '@/lib/pricing';

const fallbackCategories: Category[] = SITE_CATEGORIES.map((category) => ({
  ...category,
  created_at: new Date().toISOString(),
})) as Category[];

export default function Home() {
  const [featuredModels, setFeaturedModels] = useState<Model[]>([]);
  const [freeModels, setFreeModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [featuredRes, freeRes, catRes] = await Promise.all([
        supabase.from('models').select('*, categories(*), sellers(*)').order('rating', { ascending: false }).limit(8),
        supabase.from('models').select('*, categories(*), sellers(*)').eq('is_free', true).limit(4),
        supabase.from('categories').select('*').order('name'),
      ]);
      setFeaturedModels(featuredRes.data ?? []);
      setFreeModels(freeRes.data ?? []);
      setCategories(catRes.data && catRes.data.length > 0 ? catRes.data : fallbackCategories);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(/CL_background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center left',
          backgroundRepeat: 'no-repeat',
          opacity: 0.95,
          filter: 'brightness(1.1) saturate(1.0)',
          transform: 'scale(0.92)'
        }} />
        <div className="absolute inset-0 bg-white/15" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent-500/3 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Over 50,000 3D models from top creators
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-slide-up">
              Premium 3D Models<br />for Every Creator
            </h1>
            <p className="mt-6 text-lg text-primary-100 max-w-xl animate-slide-up">
              Discover, buy, and sell high-quality 3D assets for games, film, architecture, and AR/VR projects. Join thousands of creators on CreateLab.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-slide-up">
              <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors active:scale-[0.98]">
                Explore Models <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/sell" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors active:scale-[0.98]">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-1">Find exactly what you need across our curated categories</p>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-primary-600 hover:text-primary-700 hidden md:flex items-center gap-1">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="card p-5 text-center hover:border-primary-300 hover:bg-primary-50/50 group"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                {cat.icon || '📦'}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-primary-700">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured models */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Rated Models</h2>
            <p className="text-gray-500 mt-1">Highest-rated 3D assets from our community</p>
          </div>
          <Link to="/shop?sort=rating" className="text-sm font-semibold text-primary-600 hover:text-primary-700 hidden md:flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </section>

      {/* Free models */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Free Downloads</h2>
            <p className="text-gray-500 mt-1">Get started with these free 3D models</p>
          </div>
          <Link to="/shop?sort=free" className="text-sm font-semibold text-primary-600 hover:text-primary-700 hidden md:flex items-center gap-1">
            More Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {freeModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </section>

      {/* Sell CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary-800 to-primary-600 overflow-hidden p-8 md:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Become a CreateLab Seller</h2>
              <p className="text-primary-100 mt-3 text-lg">
                Turn your 3D modeling skills into income. Join our community of creators and sell your models to buyers worldwide.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{formatSellerPayout('free')}</p>
                <p className="text-sm text-primary-200">Free Tier Payout</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">24h</p>
                <p className="text-sm text-primary-200">Fast Payouts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">0%</p>
                <p className="text-sm text-primary-200">Listing Fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Secure Licensing', desc: 'Every model comes with clear, standard licensing for commercial and personal use.' },
            { icon: Download, title: 'Instant Download', desc: 'Get immediate access to your purchased models with no waiting time.' },
            { icon: Users, title: 'Creator Community', desc: 'Join a thriving community of 3D artists and creators worldwide.' },
          ].map((item, i) => (
            <div key={i} className="text-center p-6">
              <div className="w-14 h-14 mx-auto rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <item.icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
              <p className="text-gray-500 mt-2 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
