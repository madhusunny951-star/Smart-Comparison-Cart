import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  MapPin,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: (tab?: string) => void;
  onOpenAdmin: () => void;
  currentView: string;
}

const CATEGORIES = [
  'All',
  'Dairy, Bread & Eggs',
  'Fruits & Vegetables',
  'Cooking Essentials & Oils',
  'Snacks & Munchies',
  'Beverages & Tea',
  'Personal & Home Care',
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenCart,
  onOpenNotifications,
  onOpenAccount,
  onOpenAdmin,
  currentView,
}) => {
  const { user, signInWithGoogle, loginAsDemoUser, logout } = useAuth();
  const { itemCount } = useCart();
  const [pincode, setPincode] = useState('560103');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [tempPincode, setTempPincode] = useState('560103');
  const [userDropdown, setUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Banner for Savings & Official Redirection Notice */}
      <div className="bg-emerald-700 text-white text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> Multi-Platform Grocery Engine
          </span>
          <span>Comparing live prices on Blinkit • Zepto • Swiggy • BigBasket • DMart • Flipkart</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-emerald-100 text-xs">
          <span>⚡ Express 15-Min SmartCart Delivery</span>
          <button
            onClick={() => onOpenAccount('support')}
            className="hover:text-white underline cursor-pointer"
          >
            24/7 Support
          </button>
        </div>
      </div>

      {/* Main Flipkart-Style Green Header Navigation */}
      <div className="bg-emerald-600 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
                  SmartCart<span className="text-amber-300">.</span>
                </span>
                <p className="text-[10px] text-emerald-100 font-medium tracking-wide uppercase">
                  Price Compare & Express Shop
                </p>
              </div>
            </button>

            {/* Delivery Pincode Selector */}
            <button
              onClick={() => setShowPincodeModal(true)}
              className="hidden md:flex items-center gap-1.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg border border-emerald-500/50 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <div className="text-left">
                <div className="text-[10px] text-emerald-200 leading-tight">Deliver to</div>
                <div className="font-semibold leading-tight">Bengaluru {pincode}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-emerald-200" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milk, atta, oil, Maggi, veggies, detergents..."
                className="w-full bg-white text-gray-900 placeholder-gray-400 pl-10 pr-10 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-gray-400 hover:text-gray-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: Notifications, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-white hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            </button>

            {/* User Account / Sign In Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer border border-white/20"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline max-w-[100px] truncate">
                  {user ? user.displayName : 'Sign In'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>

              {userDropdown && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {user.role === 'admin' ? '🛡️ Administrator' : '🛒 Prime Customer'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          onOpenAccount('profile');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <User className="w-4 h-4 text-gray-500" /> My Profile
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          onOpenAccount('orders');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <ShoppingCart className="w-4 h-4 text-emerald-600" /> My Orders & Tracking
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          onOpenAccount('addresses');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <MapPin className="w-4 h-4 text-amber-500" /> Saved Addresses
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setUserDropdown(false);
                            onOpenAdmin();
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm bg-purple-50 text-purple-900 hover:bg-purple-100 flex items-center gap-2.5 cursor-pointer font-bold border-y border-purple-200"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-700" /> Admin Control Panel
                        </button>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>

                      <div className="px-4 py-1.5 text-xs text-gray-400 font-semibold">Switch Account</div>
                      <button
                        onClick={() => {
                          loginAsDemoUser(user.role === 'admin' ? 'customer' : 'admin');
                          setUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        Switch to {user.role === 'admin' ? 'Customer Profile' : 'Admin Mode'}
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer font-medium border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <p className="text-xs text-gray-500">Sign in to sync your cart, orders, and addresses.</p>
                      <button
                        onClick={() => {
                          signInWithGoogle();
                          setUserDropdown(false);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        Sign in with Google
                      </button>
                      <button
                        onClick={() => {
                          loginAsDemoUser('customer');
                          setUserDropdown(false);
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded-lg text-xs cursor-pointer"
                      >
                        Explore as Demo Customer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-3.5 py-2 rounded-lg transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-900" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-extrabold">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Category Navigation Bar (Flipkart style) */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto no-scrollbar py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-2 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Aisles:
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pincode Change Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" /> Select Delivery Location
              </h3>
              <button
                onClick={() => setShowPincodeModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Enter your Indian 6-digit postal pincode to see accurate delivery times from Blinkit, Zepto,
              Swiggy Instamart, BigBasket, DMart, and Flipkart.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Enter Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 560103"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPincodeModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (tempPincode.length === 6) {
                    setPincode(tempPincode);
                    setShowPincodeModal(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
