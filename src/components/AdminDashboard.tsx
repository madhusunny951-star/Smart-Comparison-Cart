import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Product, Order, SupportTicket } from '../types/index.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  ShieldAlert,
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  RefreshCw,
  Edit2,
  Check,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Truck,
  Layers,
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshProducts: () => void;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onRefreshProducts }) => {
  const { getAuthHeader } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'refunds' | 'tickets'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('Out for Delivery');
  const [statusNote, setStatusNote] = useState('Rider out for delivery from hub');
  const [replyText, setReplyText] = useState('');
  const [ticketToReply, setTicketToReply] = useState<SupportTicket | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newSmartcartPrice, setNewSmartcartPrice] = useState<number>(0);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();

      const [anRes, ordRes, prdRes, tktRes] = await Promise.all([
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/products', { headers }),
        fetch('/api/admin/tickets', { headers }),
      ]);

      if (anRes.ok) setAnalytics(await anRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (prdRes.ok) setProductsList(await prdRes.json());
      if (tktRes.ok) setTickets(await tktRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ status: newStatus, note: statusNote }),
      });
      if (res.ok) {
        await fetchAdminData();
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdateProductPrice = async (prodId: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ smartcartPrice: newSmartcartPrice }),
      });
      if (res.ok) {
        setEditingPriceId(null);
        await fetchAdminData();
        onRefreshProducts();
      }
    } catch (err) {
      console.error('Failed to update product price:', err);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ reply: replyText, status: 'Resolved' }),
      });
      if (res.ok) {
        setTicketToReply(null);
        setReplyText('');
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to reply to ticket:', err);
    }
  };

  const handleUpdateRefund = async (orderId: string, status: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/admin/refunds/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ refundStatus: status }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update refund:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
              ADMIN CONTROL
            </span>
            <span className="text-gray-400 text-xs">Cloud SQL (PostgreSQL) Powered</span>
          </div>
          <h1 className="text-2xl font-black mt-1 text-white">SmartCart Executive Center</h1>
          <p className="text-xs text-gray-400">
            Real-time grocery catalog, live orders, Razorpay refunds, and platform metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-gray-300 hover:text-white cursor-pointer"
            title="Refresh Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
          >
            Exit to Storefront
          </button>
        </div>
      </div>

      {/* Admin KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Total Revenue</span>
            <div className="text-xl font-black text-gray-900">₹{analytics?.totalRevenue || 0}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Total Orders</span>
            <div className="text-xl font-black text-gray-900">{orders.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Active Catalog</span>
            <div className="text-xl font-black text-gray-900">{productsList.length} items</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold">Support Tickets</span>
            <div className="text-xl font-black text-gray-900">{tickets.length}</div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1 text-xs font-bold shadow-xs">
        {[
          { id: 'overview', label: 'Analytics & Insights' },
          { id: 'orders', label: `Manage Orders (${orders.length})` },
          { id: 'products', label: `Catalog & Price Control (${productsList.length})` },
          { id: 'refunds', label: 'Refunds & Returns' },
          { id: 'tickets', label: `Support Tickets (${tickets.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 px-3 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & RECHARTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Platform Clicks Comparison */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Platform Shopping Volume</h3>
                <p className="text-[11px] text-gray-500">Clicks and redirections per platform</p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                Live Data
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.platformBreakdown || []}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Order Status Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Order Status Breakdown</h3>
              <p className="text-[11px] text-gray-500">Fulfillment pipeline stages</p>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      analytics?.statusCounts
                        ? Object.entries(analytics.statusCounts).map(([k, v]) => ({ name: k, value: v }))
                        : [{ name: 'Orders', value: 1 }]
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {COLORS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE ORDERS (UPDATE STATUS & TIMELINE) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">Live Order Pipeline</h3>
            <span className="text-xs text-gray-500">
              Select an order to simulate rider dispatch and status progression
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {orders.map((o) => (
              <div key={o.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-sm">#{o.id}</span>
                    <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded">
                      {o.userName} ({o.userPhone})
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
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
                  <p className="text-gray-500">
                    {o.items.length} items • ₹{o.totalAmount} • {o.deliverySlot}
                  </p>
                  <p className="text-gray-400 text-[11px] truncate max-w-lg">{o.deliveryAddress}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(o);
                      setNewStatus(o.orderStatus);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" /> Advance Status
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal to update status */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                <h4 className="font-bold text-gray-900 text-base">
                  Update Status for Order #{selectedOrder.id}
                </h4>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Fulfillment Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-medium"
                  >
                    <option>Order Placed</option>
                    <option>Order Confirmed</option>
                    <option>Processing</option>
                    <option>Packed</option>
                    <option>Shipped</option>
                    <option>Out for Delivery</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Tracking Event Note</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Rider Ramesh Kumar has picked up the bag"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-medium"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id)}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                  >
                    Save & Notify Customer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRODUCTS & PRICE MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm">Product Price Management</h3>
            <p className="text-xs text-gray-500">Update SmartCart direct pricing to stay competitive</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {productsList.map((p) => (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-gray-50" />
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                    <p className="text-gray-500">{p.brand} • {p.quantity} • {p.category}</p>
                    <p className="text-emerald-700 font-semibold mt-0.5">
                      Current SmartCart Price: <strong>₹{p.smartcartPrice}</strong> ({p.smartcartDiscount}% OFF)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingPriceId === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">₹</span>
                      <input
                        type="number"
                        value={newSmartcartPrice}
                        onChange={(e) => setNewSmartcartPrice(Number(e.target.value))}
                        className="w-20 border border-gray-300 rounded-lg p-1.5 text-xs font-bold"
                      />
                      <button
                        onClick={() => handleUpdateProductPrice(p.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                        title="Save Price"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPriceId(p.id);
                        setNewSmartcartPrice(p.smartcartPrice);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Price
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REFUNDS & RETURNS */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">Customer Refund Requests</h3>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {orders
              .filter((o) => o.refundStatus !== 'None')
              .map((o) => (
                <div key={o.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 text-sm">Order #{o.id}</span>
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                        {o.refundStatus}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Customer: {o.userName} ({o.userEmail}) • Reason: {o.cancellationReason || 'Requested'}
                    </p>
                    <p className="text-emerald-700 font-bold mt-0.5">
                      Refund Value: ₹{o.refundAmount || o.totalAmount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateRefund(o.id, 'Processing')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Mark Processing
                    </button>
                    <button
                      onClick={() => handleUpdateRefund(o.id, 'Completed')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Approve & Complete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">Customer Complaints & Inquiries</h3>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-gray-400 font-bold">{t.id}</span>
                    <h4 className="font-bold text-gray-900 text-sm">{t.subject}</h4>
                    <p className="text-gray-500">From: {t.userEmail} • Category: {t.category}</p>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">"{t.message}"</p>
                {t.reply ? (
                  <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                    <strong>Admin Reply:</strong> {t.reply}
                  </p>
                ) : (
                  <button
                    onClick={() => setTicketToReply(t)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Reply to Customer
                  </button>
                )}
              </div>
            ))}
          </div>

          {ticketToReply && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl">
                <h4 className="font-bold text-gray-900">Reply to Ticket #{ticketToReply.id}</h4>
                <p className="text-xs text-gray-500">{ticketToReply.subject}</p>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official response to customer..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-medium"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setTicketToReply(null)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReplyTicket(ticketToReply.id)}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                  >
                    Send Resolution
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
