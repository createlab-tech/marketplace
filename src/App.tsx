import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ModelDetail from '@/pages/ModelDetail';
import Category from '@/pages/Category';
import Categories from '@/pages/Categories';
import SellerProfile from '@/pages/SellerProfile';
import Cart from '@/pages/Cart';
import { SignIn, SignUp } from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Sell from '@/pages/Sell';
import Favorites from '@/pages/Favorites';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminModels from '@/pages/admin/AdminModels';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminSellers from '@/pages/admin/AdminSellers';
import AdminOrders from '@/pages/admin/AdminOrders';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="models" element={<AdminModels />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Store routes */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/model/:slug" element={<ModelDetail />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/category/:slug" element={<Category />} />
                    <Route path="/seller/:slug" element={<SellerProfile />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/sell" element={<Sell />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="*" element={
                      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                        <h1 className="text-4xl font-bold text-gray-900">404</h1>
                        <p className="text-gray-500 mt-2">Page not found</p>
                      </div>
                    } />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;