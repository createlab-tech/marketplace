import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, ShoppingCart, Heart, Menu, X, Upload, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

export default function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/createlogo.jpg"
              alt="CreateLab logo"
              className="h-9 w-9 object-cover rounded-lg"
            />
            <span className="font-display font-bold text-xl text-gray-900 hidden sm:block">
              Create<span className="text-primary-600">Lab</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 3D models, categories, creators..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-lg border border-transparent focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/shop" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              Browse
            </Link>
            <Link to="/categories" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              Categories
            </Link>
            <Link to="/pricing" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              Pricing
            </Link>
            <Link to="/sell" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              Sell
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/favorites" className="p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50 hidden sm:block">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Heart className="w-4 h-4" /> Favorites
                      </Link>
                      <Link to="/sell" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4" /> Upload Model
                      </Link>
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors w-full text-left">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/signin" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 animate-slide-up">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 3D models..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-lg border border-transparent focus:bg-white focus:border-primary-500 focus:outline-none transition-all"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Browse</Link>
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Categories</Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Pricing</Link>
              <Link to="/sell" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Sell</Link>
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="btn-secondary flex-1">Sign In</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn-primary flex-1">Sign Up</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
