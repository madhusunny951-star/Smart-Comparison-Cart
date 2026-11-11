import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderTrackingView } from './components/OrderTrackingView.tsx';
import { AccountDashboard } from './components/AccountDashboard.tsx';
import { CustomerSupportModal } from './components/CustomerSupportModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { Product, Order } from './types/index.ts';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  RotateCcw,
  Clock,
  TrendingDown,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Truck,
} from 'lucide-react';

function SmartCartStore() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Navigation states
  const [view, setView] = useState<'store' | 'tracking' | 'account' | 'admin'>('store');
  const [activeOrderToTrack, setActiveOrderToTrack] = useState<Order | null>(null);
  const [accountInitialTab, setAccountInitialTab] = useState<string>('profile');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  // User's orders cache for support
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/products', window.location.origin);
      if (selectedCategory && selectedCategory !== 'All') {
        url.searchParams.set('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim());
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Load sample or current order for quick tracking preview
  useEffect(() => {
    const loadRecentOrder = async () => {
      try {
        const res = await fetch('/api/orders?userId=demo-user-123');
        if (res.ok) {
          const ords = await res.json();
          setUserOrders(ords);
        }
      } catch (e) {
        // ignore
      }
    };
    loadRecentOrder();
  }, []);

  const handleOrderCompleted = (newOrder: Order) => {
    setActiveOrderToTrack(newOrder);
    setView('tracking');
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          if (view !== 'store') setView('store');
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        onOpenAccount={(tab = 'profile') => {
          setAccountInitialTab(tab);
          setView('account');
        }}
        onOpenAdmin={() => setView('admin')}
        currentView={view}
      />

      {/* Main View Switcher */}
      <main className="flex-1 pb-16">
        {view === 'admin' ? (
          <AdminDashboard
            onClose={() => setView('store')}
            onRefreshProducts={fetchProducts}
          />
        ) : view === 'account' ? (
          <AccountDashboard
            initialTab={accountInitialTab}
            onSelectOrderToTrack={(ord) => {
              setActiveOrderToTrack(ord);
              setView('tracking');
            }}
            onOpenCustomerSupport={() => setIsSupportOpen(true)}
            onClose={() => setView('store')}
          />
        ) : view === 'tracking' && activeOrderToTrack ? (
          <OrderTrackingView
            order={activeOrderToTrack}
            onBack={() => setView('account')}
            onRefreshOrder={(up) => setActiveOrderToTrack(up)}
          />
        ) : (
          /* STOREFRONT MAIN VIEW */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Hero Flipkart-Inspired Green Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-10 shadow-xl border border-emerald-600">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-emerald-500/40 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" /> India's #1 Grocery Price Comparison Engine
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white">
                  Stop overpaying for groceries.
                </h1>
                <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed">
                  Compare real-time prices across <strong>Blinkit</strong>, <strong>Zepto</strong>,{' '}
                  <strong>Swiggy Instamart</strong>, <strong>BigBasket</strong>, <strong>DMart</strong>, and{' '}
                  <strong>Flipkart</strong>. Buy directly with 15-min delivery or jump to official websites.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById('products-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-black px-6 py-3 rounded-xl text-sm shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Compare Live Prices</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="bg-emerald-900/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-emerald-500/30 text-xs text-emerald-100">
                    Use code <span className="font-extrabold text-amber-300">SMART50</span> for 50% OFF
                  </div>
                </div>
              </div>

              {/* Decorative floating badges */}
              <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 space-y-3 w-72">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl text-white shadow-xl">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Amul Milk 1L</span>
                    <span className="text-emerald-300">₹70 Lowest</span>
                  </div>
                  <p className="text-[11px] text-emerald-200 mt-1">Saved ₹8 vs quick commerce avg</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl text-white shadow-xl">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Aashirvaad Atta 5kg</span>
                    <span className="text-emerald-300">₹239 Lowest</span>
                  </div>
                  <p className="text-[11px] text-emerald-200 mt-1">DMart & SmartCart match</p>
                </div>
              </div>
            </div>

            {/* Official Shopping Platforms Strip */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 border-b border-gray-100 pb-2.5">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Official Shopping Platform Links
                  </h3>
                  <p className="text-xs text-gray-500">
                    SmartCart provides transparent comparison. Click any platform to visit their official store.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  100% Genuine Redirects
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { name: 'Blinkit', url: 'https://blinkit.com', color: 'border-amber-300 hover:bg-amber-50/50', eta: '10 mins' },
                  { name: 'Zepto', url: 'https://www.zeptonow.com', color: 'border-purple-300 hover:bg-purple-50/50', eta: '10 mins' },
                  { name: 'Swiggy Instamart', url: 'https://www.swiggy.com/instamart', color: 'border-orange-300 hover:bg-orange-50/50', eta: '15 mins' },
                  { name: 'BigBasket', url: 'https://www.bigbasket.com', color: 'border-green-300 hover:bg-green-50/50', eta: '30 mins' },
                  { name: 'DMart', url: 'https://www.dmart.in', color: 'border-emerald-300 hover:bg-emerald-50/50', eta: 'Next Day' },
                  { name: 'Flipkart', url: 'https://www.flipkart.com/grocery-supermart-store', color: 'border-blue-300 hover:bg-blue-50/50', eta: 'Same Day' },
                ].map((plat) => (
                  <a
                    key={plat.name}
                    href={plat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`border rounded-xl p-3 flex flex-col justify-between transition-all bg-white shadow-xs group cursor-pointer ${plat.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-gray-900">{plat.name}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">Delivery: {plat.eta}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Guaranteed Lowest Price</h4>
                  <p className="text-[11px] text-gray-500">Live catalog sync</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">15-Min Express Drop</h4>
                  <p className="text-[11px] text-gray-500">Bellandur darkstore hub</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Razorpay Verified</h4>
                  <p className="text-[11px] text-gray-500">UPI, Cards & NetBanking</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Doorstep Instant Refund</h4>
                  <p className="text-[11px] text-gray-500">No questions asked</p>
                </div>
              </div>
            </div>

            {/* Products Comparison Section */}
            <div id="products-grid" className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    {selectedCategory === 'All' ? 'Popular Grocery Deals' : selectedCategory}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Comparing prices across Blinkit, Zepto, Swiggy Instamart, BigBasket, DMart, and Flipkart
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Showing {products.length} grocery items</span>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-12">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse space-y-3">
                      <div className="aspect-4/3 bg-gray-200 rounded-xl" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 space-y-3">
                  <p className="text-base font-bold text-gray-900">No grocery products matched your search.</p>
                  <p className="text-xs text-gray-500">Try searching for milk, atta, oil, tea, or surf excel.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Live Order Bar if recent order exists */}
            {userOrders.length > 0 && (
              <div className="bg-emerald-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-300 uppercase">Live Delivery Tracking</span>
                    <p className="text-sm font-black text-white">
                      Order #{userOrders[0].id} is {userOrders[0].orderStatus}
                    </p>
                    <p className="text-xs text-emerald-200">
                      ETA: {userOrders[0].estimatedDeliveryDate} • {userOrders[0].deliveryAddress}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveOrderToTrack(userOrders[0]);
                    setView('tracking');
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Live Tracker</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Customer Support Modal */}
      <CustomerSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        orders={userOrders}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
      />

      {/* Flipkart-Inspired Footer */}
      <footer className="bg-slate-900 text-gray-300 text-xs border-t border-slate-800 pt-10 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <span className="text-xl font-black text-white tracking-tight flex items-center gap-1">
              SmartCart<span className="text-emerald-400">.</span>
            </span>
            <p className="text-gray-400 text-xs leading-relaxed">
              India's premier grocery price intelligence and direct hyperlocal fulfillment platform. We
              empower customers with price transparency across quick commerce and retail giants.
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold">
              🔒 256-Bit SSL Encrypted Razorpay Checkout
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Compared Platforms</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><a href="https://blinkit.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Blinkit (Zomato)</a></li>
              <li><a href="https://www.zeptonow.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Zepto Now</a></li>
              <li><a href="https://www.swiggy.com/instamart" target="_blank" rel="noopener noreferrer" className="hover:text-white">Swiggy Instamart</a></li>
              <li><a href="https://www.bigbasket.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">BigBasket (Tata Digital)</a></li>
              <li><a href="https://www.dmart.in" target="_blank" rel="noopener noreferrer" className="hover:text-white">DMart Ready</a></li>
              <li><a href="https://www.flipkart.com/grocery-supermart-store" target="_blank" rel="noopener noreferrer" className="hover:text-white">Flipkart Grocery</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Customer Experience</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li>
                <button onClick={() => { setAccountInitialTab('orders'); setView('account'); }} className="hover:text-white cursor-pointer">
                  Track My Orders
                </button>
              </li>
              <li>
                <button onClick={() => { setAccountInitialTab('refunds'); setView('account'); }} className="hover:text-white cursor-pointer">
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button onClick={() => setIsSupportOpen(true)} className="hover:text-white cursor-pointer">
                  24/7 Help Desk & Complaints
                </button>
              </li>
              <li>
                <button onClick={() => { setAccountInitialTab('coupons'); setView('account'); }} className="hover:text-white cursor-pointer">
                  SmartCart Discount Coupons
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Admin & Technology</h4>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Built with PostgreSQL (Cloud SQL), Drizzle ORM, Firebase Auth, Express.js, React.js, Tailwind CSS,
              and Razorpay Gateway integration.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setView('admin')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-700 cursor-pointer"
              >
                Access Admin Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-2">
          <p>© 2026 SmartCart Supermart Hyperlocal Logistics Ltd. All rights reserved.</p>
          <p>Official Platform Trademarks belong to their respective registered corporate entities.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SmartCartStore />
      </CartProvider>
    </AuthProvider>
  );
}
