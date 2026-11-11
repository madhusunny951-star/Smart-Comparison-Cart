import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Order, Address, Coupon, NotificationItem } from '../types/index.ts';
import { generateInvoicePdf } from '../utils/invoiceGenerator.ts';
import {
  User,
  ShoppingBag,
  MapPin,
  CreditCard,
  RotateCcw,
  Tag,
  Bell,
  HelpCircle,
  FileDown,
  ChevronRight,
  LogOut,
  Truck,
  Plus,
  Trash2,
} from 'lucide-react';

interface AccountDashboardProps {
  initialTab?: string;
  onSelectOrderToTrack: (order: Order) => void;
  onOpenCustomerSupport: () => void;
  onClose: () => void;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  initialTab = 'orders',
  onSelectOrderToTrack,
  onOpenCustomerSupport,
  onClose,
}) => {
  const { user, logout, getAuthHeader } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = await getAuthHeader();
        const userId = user?.uid || 'guest-session';

        // Fetch Orders
        const ordRes = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`, { headers });
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(ordData);
        }

        // Fetch Addresses
        const addrRes = await fetch(`/api/addresses?userId=${encodeURIComponent(userId)}`, { headers });
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          setAddresses(addrData);
        }

        // Fetch Notifications
        const notifRes = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`, { headers });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData);
        }

        // Fetch Coupons
        const coupRes = await fetch('/api/coupons');
        if (coupRes.ok) {
          const coupData = await coupRes.json();
          setCoupons(coupData);
        }
      } catch (err) {
        console.error('Failed to load account data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', count: orders.length, icon: ShoppingBag },
    { id: 'addresses', label: 'Saved Addresses', count: addresses.length, icon: MapPin },
    { id: 'payments', label: 'Payment History', icon: CreditCard },
    { id: 'refunds', label: 'Refund History', count: orders.filter((o) => o.refundStatus !== 'None').length, icon: RotateCcw },
    { id: 'coupons', label: 'My Coupons', count: coupons.length, icon: Tag },
    { id: 'notifications', label: 'Notifications', count: notifications.filter((n) => !n.read).length, icon: Bell },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My SmartCart Account</h1>
          <p className="text-xs text-gray-500">Manage your orders, saved addresses, payments & support</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
        >
          Back to Store
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Navigation Sidebar (Flipkart Style) */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
              {user?.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Hello,</span>
              <h3 className="font-extrabold text-sm text-gray-900 truncate">
                {user ? user.displayName : 'Guest Shopper'}
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium truncate">{user?.email}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={onOpenCustomerSupport}
              className="w-full px-4 py-3 flex items-center gap-2.5 text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer font-bold"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Customer Support 24/7</span>
            </button>

            <button
              onClick={logout}
              className="w-full px-4 py-3 flex items-center gap-2.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Right Tab Content View */}
        <div className="md:col-span-3 space-y-4">
          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase text-[10px]">Full Name</label>
                  <p className="font-bold text-sm text-gray-900">{user?.displayName}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase text-[10px]">Email Address</label>
                  <p className="font-bold text-sm text-gray-900">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase text-[10px]">Mobile Phone</label>
                  <p className="font-bold text-sm text-gray-900">{user?.phone || '+91 98765 43210'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold uppercase text-[10px]">User Role</label>
                  <p className="font-bold text-sm text-emerald-700 uppercase">{user?.role || 'Customer'}</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">SmartCart Member Benefits:</p>
                <p>• 15-Minute Express Guaranteed Delivery</p>
                <p>• Multi-Platform Best Price Match</p>
                <p>• Doorstep Hassle-Free Returns & Instant Refunds</p>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Order History ({orders.length})</h3>

              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-xs">
                  <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-bold text-gray-800 text-sm">No orders yet</p>
                  <p className="mt-1">Compare prices and place your first grocery order today!</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 text-sm">#{o.id}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              o.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(o.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateInvoicePdf(o)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5 text-emerald-600" /> Invoice
                        </button>
                        <button
                          onClick={() => onSelectOrderToTrack(o)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Order
                        </button>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="space-y-1.5 text-xs text-gray-700">
                      {o.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="truncate max-w-md">
                            {item.quantity}x {item.name} ({item.unit})
                          </span>
                          <span className="font-semibold text-gray-900">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      {o.items.length > 3 && (
                        <p className="text-[11px] text-gray-400 italic">
                          +{o.items.length - 3} more items in order
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        Paid via <strong>{o.paymentMethod}</strong> (TXN: {o.transactionId})
                      </span>
                      <span className="font-black text-gray-900 text-sm">Total: ₹{o.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Delivery Addresses ({addresses.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 space-y-1.5 text-xs shadow-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm">{addr.name}</span>
                      <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {addr.type}
                      </span>
                    </div>
                    <p className="text-gray-600">{addr.addressLine}</p>
                    <p className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-gray-500 font-medium">Ph: {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PAYMENT HISTORY */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Payment & Transaction History</h3>
              <div className="divide-y divide-gray-100 text-xs">
                {orders.map((o) => (
                  <div key={o.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">
                        Order #{o.id} • {o.paymentMethod}
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        Txn ID: {o.transactionId} • {new Date(o.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-gray-900 text-sm">₹{o.totalAmount}</span>
                      <span className="block text-[10px] text-emerald-700 font-bold uppercase">
                        {o.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REFUND HISTORY */}
          {activeTab === 'refunds' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Refund Records</h3>
              {orders.filter((o) => o.refundStatus !== 'None').length === 0 ? (
                <p className="text-xs text-gray-500">No refund requests found.</p>
              ) : (
                orders
                  .filter((o) => o.refundStatus !== 'None')
                  .map((o) => (
                    <div key={o.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Order #{o.id} Refund</span>
                        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          {o.refundStatus}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Refund Amount: <strong>₹{o.refundAmount || o.totalAmount}</strong> credited back to source account.
                      </p>
                      {o.cancellationReason && (
                        <p className="text-gray-500 text-[11px]">Reason: {o.cancellationReason}</p>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="bg-white border-2 border-dashed border-emerald-400 rounded-xl p-4 space-y-2 text-xs shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-emerald-800 text-sm tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <span className="text-emerald-700 font-bold">{c.discountPercent}% OFF</span>
                  </div>
                  <p className="text-gray-700">{c.description}</p>
                  <p className="text-[10px] text-gray-400">Valid till {c.validTill}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-sm">All Notifications</h3>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-900">{n.title}</h4>
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-gray-600">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
