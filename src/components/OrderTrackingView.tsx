import React, { useState } from 'react';
import { Order } from '../types/index.ts';
import { generateInvoicePdf } from '../utils/invoiceGenerator.ts';
import {
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  FileDown,
  RotateCcw,
  XCircle,
  Truck,
  Phone,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface OrderTrackingViewProps {
  order: Order;
  onBack: () => void;
  onRefreshOrder?: (updated: Order) => void;
}

const TIMELINE_STEPS = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  onBack,
  onRefreshOrder,
}) => {
  const { getAuthHeader } = useAuth();
  const { addToCart } = useCart();
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of delivery address / mind');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged or near-expiry product received');
  const [actionMsg, setActionMsg] = useState('');

  const statusIndex = TIMELINE_STEPS.indexOf(currentOrder.orderStatus);

  const handleCancelOrder = async () => {
    try {
      setActionLoading(true);
      const headers = await getAuthHeader();
      const res = await fetch(`/api/orders/${currentOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated: Order = {
          ...data.order,
          items: typeof data.order.items === 'string' ? JSON.parse(data.order.items) : data.order.items,
          trackingHistory:
            typeof data.order.trackingHistory === 'string'
              ? JSON.parse(data.order.trackingHistory)
              : data.order.trackingHistory,
        };
        setCurrentOrder(updated);
        if (onRefreshOrder) onRefreshOrder(updated);
        setShowCancelModal(false);
        setActionMsg('Order successfully cancelled. Full refund initiated via Razorpay.');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async () => {
    try {
      setActionLoading(true);
      const headers = await getAuthHeader();
      const res = await fetch(`/api/orders/${currentOrder.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ reason: returnReason }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated: Order = {
          ...data.order,
          items: typeof data.order.items === 'string' ? JSON.parse(data.order.items) : data.order.items,
          trackingHistory:
            typeof data.order.trackingHistory === 'string'
              ? JSON.parse(data.order.trackingHistory)
              : data.order.trackingHistory,
        };
        setCurrentOrder(updated);
        if (onRefreshOrder) onRefreshOrder(updated);
        setShowReturnModal(false);
        setActionMsg('Return request submitted. Pickup scheduled within 24 hours.');
      }
    } catch (err) {
      console.error('Return order error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReorder = () => {
    currentOrder.items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: 'Grocery',
        quantity: item.unit,
        imageUrl: item.image,
        rating: '4.7',
        ratingCount: 150,
        inStock: true,
        smartcartPrice: item.price,
        smartcartDiscount: 10,
        smartcartDeliveryTime: '15 mins',
        smartcartDeliveryFee: 0,
      });
    });
    setActionMsg('All items from this order added to your cart!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-200 pb-4">
        <button
          onClick={onBack}
          className="text-xs font-bold text-gray-600 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateInvoicePdf(currentOrder)}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-600" /> Download Tax Invoice (PDF)
          </button>
          <button
            onClick={handleReorder}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reorder Basket
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="font-bold text-emerald-900 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Order Card Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-gray-900">Order #{currentOrder.id}</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  currentOrder.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentOrder.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {currentOrder.orderStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(currentOrder.createdAt).toLocaleString('en-IN')} • Payment: {currentOrder.paymentMethod}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">Total Paid</span>
            <div className="text-xl font-black text-gray-900">₹{currentOrder.totalAmount}</div>
          </div>
        </div>

        {/* Live Tracking Information & Timeline (Flipkart style) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> Order Tracking Progress
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
              ETA: {currentOrder.estimatedDeliveryDate}
            </span>
          </div>

          {/* Flipkart Visual Stepper */}
          <div className="py-4 px-2">
            <div className="relative">
              {/* Connecting background line */}
              <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0" />
              {/* Active filled line */}
              <div
                className="absolute top-4 left-6 h-1 bg-emerald-600 transition-all duration-500 -z-0"
                style={{
                  width: `${
                    statusIndex >= 0 ? (statusIndex / (TIMELINE_STEPS.length - 1)) * 100 : 0
                  }%`,
                }}
              />

              <div className="flex justify-between relative z-10">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = statusIndex >= idx;
                  const isCurrent = statusIndex === idx;
                  return (
                    <div key={step} className="flex flex-col items-center max-w-[80px] text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] mt-2 leading-tight ${
                          isDone ? 'font-bold text-gray-900' : 'text-gray-400 font-medium'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulated Rider & Fulfillment Card */}
          {currentOrder.orderStatus === 'Out for Delivery' && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  RK
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Rider: Ramesh Kumar</p>
                  <p className="text-gray-600">SmartCart Hyperlocal Partner • 4.9 ★ (840 deliveries)</p>
                  <p className="text-emerald-700 font-semibold mt-0.5">
                    Rider is 1.1 km away. Share OTP: <strong>5821</strong> at doorstep.
                  </p>
                </div>
              </div>
              <a
                href="tel:+919876543210"
                className="px-3.5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" /> Call Delivery Partner
              </a>
            </div>
          )}

          {/* Refund Notice if applicable */}
          {currentOrder.refundStatus !== 'None' && (
            <div className="mt-4 bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm">Refund Status: {currentOrder.refundStatus}</span>
                <p className="text-amber-800 mt-0.5">
                  Amount: ₹{currentOrder.refundAmount || currentOrder.totalAmount} will be credited to source
                  Razorpay account within 2-4 business hours.
                </p>
              </div>
              <span className="bg-amber-200 text-amber-900 font-black px-2.5 py-1 rounded-md">
                ₹{currentOrder.refundAmount || currentOrder.totalAmount}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: Cancel Order / Return Order */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
          {currentOrder.orderStatus !== 'Delivered' && currentOrder.orderStatus !== 'Cancelled' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel Order
            </button>
          )}

          {currentOrder.orderStatus === 'Delivered' && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-4 py-2 border border-amber-400 text-amber-800 hover:bg-amber-50 text-xs font-bold rounded-xl cursor-pointer"
            >
              Request Return / Replacement
            </button>
          )}
        </div>
      </div>

      {/* Grid: Order Items & Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items List (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" /> Items in this Order ({currentOrder.items.length})
          </h3>
          <div className="divide-y divide-gray-100">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg bg-gray-50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-[11px] text-gray-500">
                    {item.brand} • {item.unit}
                  </p>
                  <p className="text-emerald-700 font-semibold mt-0.5">
                    {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900 text-sm">₹{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Item Subtotal:</span>
              <span className="font-semibold text-gray-900">₹{currentOrder.subtotal}</span>
            </div>
            {currentOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Savings ({currentOrder.couponCode || 'PROMO'}):</span>
                <span>-₹{currentOrder.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges:</span>
              <span className="font-semibold text-emerald-700">
                {currentOrder.deliveryFee === 0 ? 'FREE' : `₹${currentOrder.deliveryFee}`}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-sm text-gray-900">
              <span>Total Paid:</span>
              <span className="text-emerald-700">₹{currentOrder.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details & Transaction Info (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3 text-xs">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Shipping Address
            </h3>
            <div className="space-y-1 text-gray-600">
              <p className="font-bold text-gray-900">{currentOrder.userName}</p>
              <p>{currentOrder.deliveryAddress}</p>
              <p className="text-gray-500">Phone: {currentOrder.userPhone}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-2 text-xs">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Payment & Security
            </h3>
            <div className="space-y-1.5 text-gray-600">
              <p>
                <strong>Method:</strong> {currentOrder.paymentMethod}
              </p>
              <p>
                <strong>Transaction ID:</strong>{' '}
                <span className="font-mono text-gray-900 text-[11px]">{currentOrder.transactionId}</span>
              </p>
              <p>
                <strong>Gateway:</strong> Razorpay 256-bit Secure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <h4 className="font-bold text-base text-gray-900">Cancel Order #{currentOrder.id}?</h4>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to cancel this order? 100% of the paid amount (₹{currentOrder.totalAmount})
              will be refunded to your original payment method.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
              >
                <option>Change of delivery address / mind</option>
                <option>Found cheaper price elsewhere</option>
                <option>Ordered by mistake</option>
                <option>Delivery taking too long</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Order Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-600">
              <RotateCcw className="w-5 h-5" />
              <h4 className="font-bold text-base text-gray-900">Request Return for #{currentOrder.id}</h4>
            </div>
            <p className="text-xs text-gray-600">
              Our delivery representative will pick up the items and process a full refund of ₹{currentOrder.totalAmount}.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Reason for return</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
              >
                <option>Damaged or broken packaging</option>
                <option>Item expired or near expiry</option>
                <option>Incorrect item received</option>
                <option>Quality not satisfactory</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnOrder}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 cursor-pointer"
              >
                {actionLoading ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
