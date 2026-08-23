import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, ShoppingBag, Heart, Upload, TrendingUp, Package, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Order, OrderItem, Model } from '@/lib/types';
import ModelCard from '@/components/ModelCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'overview';
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [favorites, setFavorites] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [ordersRes, favRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('favorites').select('model_id').eq('user_id', user.id),
      ]);

      setOrders(ordersRes.data ?? []);

      if (ordersRes.data && ordersRes.data.length > 0) {
        const orderIds = ordersRes.data.map((o) => o.id);
        const { data: items } = await supabase.from('order_items').select('*').in('order_id', orderIds);
        setOrderItems(items ?? []);
      }

      if (favRes.data && favRes.data.length > 0) {
        const modelIds = favRes.data.map((f) => f.model_id);
        const { data: favModels } = await supabase.from('models').select('*, categories(*), sellers(*)').in('id', modelIds);
        setFavorites(favModels ?? []);
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Sign in to view your dashboard</h1>
        <Link to="/signin" className="btn-primary mt-6 inline-flex">Sign In</Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalDownloads = orderItems.length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: ShoppingBag, label: 'Orders', value: orders.length },
          { icon: Download, label: 'Downloads', value: totalDownloads },
          { icon: Heart, label: 'Favorites', value: favorites.length },
          { icon: Package, label: 'Total Spent', value: `$${totalSpent.toFixed(2)}` },
        ].map((stat, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSearchParams({ tab: t.id })}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No activity yet. Start by browsing models!</p>
                    <Link to="/shop" className="btn-primary mt-4 inline-flex">Browse Models</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">${Number(order.total).toFixed(2)}</p>
                          <span className="badge bg-success-50 text-success-700">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Link to="/shop" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                    <ShoppingBag className="w-6 h-6 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900">Browse Models</span>
                  </Link>
                  <Link to="/sell" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                    <Upload className="w-6 h-6 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900">Upload Model</span>
                  </Link>
                  <Link to="/favorites" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                    <Heart className="w-6 h-6 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900">View Favorites</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {tab === 'purchases' && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't made any purchases yet.</p>
                  <Link to="/shop" className="btn-primary mt-4 inline-flex">Browse Models</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const items = orderItems.filter((i) => i.order_id === order.id);
                    return (
                      <div key={order.id} className="card p-5">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                          <div>
                            <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${Number(order.total).toFixed(2)}</p>
                            <span className="badge bg-success-50 text-success-700">{order.status}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{item.model_title}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-900">${Number(item.price).toFixed(2)}</span>
                                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                                  <Download className="w-3.5 h-3.5" /> Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'favorites' && (
            <div>
              {favorites.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No favorites yet. Click the heart icon on any model to save it here.</p>
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
          )}
        </>
      )}
    </div>
  );
}
