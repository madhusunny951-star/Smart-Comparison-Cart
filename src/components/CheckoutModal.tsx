import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Address, Order } from '../types/index.ts';
import { RazorpayModal } from './RazorpayModal.tsx';
import {
  MapPin,
  CheckCircle,
  Truck,
  Tag,
  CreditCard,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

const STEPS = [
  '1. Delivery Address',
  '2. Order Review',
  '3. Delivery Slot',
  '4. Apply Coupon',
  '5. Payment Option',
  '6. Confirm Order',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const { user, getAuthHeader } = useAuth();
  const { cart, subtotal, deliveryFee, discount, totalAmount, appliedCoupon, applyCoupon, removeCoupon } =
    useCart();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: user?.displayName || 'Aditi Sharma',
    phone: user?.phone || '+91 98765 43210',
    addressLine: 'Flat 402, Green Glen Layout, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
  });

  const [deliverySlot, setDeliverySlot] = useState('Standard Express (15-25 Mins)');
  const [deliveryInstruction, setDeliveryInstruction] = useState('Leave with security if not answering');
  const [paymentChoice, setPaymentChoice] = useState<'razorpay' | 'cod'>('razorpay');
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch saved addresses from Cloud SQL with local fallback
  useEffect(() => {
    if (isOpen) {
      const fetchAddresses = async () => {
        try {
          const headers = await getAuthHeader();
          const userId = user?.uid || 'guest-session';
          const res = await fetch(`/api/addresses?userId=${encodeURIComponent(userId)}`, { headers });
          const contentType = res.headers.get('content-type');
          if (res.ok && contentType && contentType.includes('application/json')) {
            const data: Address[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setAddresses(data);
              const def = data.find((a) => a.isDefault) || data[0];
              setSelectedAddressId(def.id);
              return;
            }
          }
        } catch (err) {
          // ignore
        }

        // Fallback default address for offline / Netlify
        const defaultAddr: Address = {
          id: 1,
          userId: user?.uid || 'demo-user-123',
          name: user?.displayName || 'Aditi Sharma',
          phone: user?.phone || '+91 98765 43210',
          addressLine: 'Flat 402, Green Glen Layout, Bellandur Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          type: 'HOME',
          isDefault: true,
        };
        setAddresses([defaultAddr]);
        setSelectedAddressId(1);
      };
      fetchAddresses();
    }
  }, [isOpen, user?.uid]);

  if (!isOpen) return null;

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          userId,
          ...newAddress,
          isDefault: addresses.length === 0,
        }),
      });
      if (res.ok) {
        const saved: Address = await res.json();
        setAddresses((prev) => [saved, ...prev]);
        setSelectedAddressId(saved.id);
        setShowAddAddressForm(false);
      }
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handlePlaceOrderWithPayment = async (paymentDetails?: {
    transactionId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    paymentMethod: string;
  }) => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';

      const orderPayload = {
        userId,
        userEmail: user?.email || 'shopper@smartcart.in',
        userName: selectedAddress ? selectedAddress.name : user?.displayName || 'SmartCart Customer',
        userPhone: selectedAddress ? selectedAddress.phone : user?.phone || '+91 98765 43210',
        deliveryAddress: selectedAddress
          ? `${selectedAddress.addressLine}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode} (${selectedAddress.type})`
          : 'Bengaluru Express Address',
        items: cart.map((item) => ({
          id: item.productId,
          name: item.product.name,
          price: item.product.smartcartPrice,
          quantity: item.quantity,
          brand: item.product.brand,
          unit: item.product.quantity,
          image: item.product.imageUrl,
        })),
        subtotal,
        discount,
        deliveryFee,
        totalAmount,
        couponCode: appliedCoupon?.code || null,
        paymentMethod: paymentDetails?.paymentMethod || (paymentChoice === 'cod' ? 'Cash on Delivery (Pay on doorstep)' : 'Razorpay UPI/Card'),
        transactionId: paymentDetails?.transactionId || `TXN_COD_${Date.now()}`,
        deliverySlot: `${deliverySlot} - Note: ${deliveryInstruction}`,
      };

      let createdOrder: Order | null = null;
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(orderPayload),
        });
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const result = await res.json();
          createdOrder = {
            ...result.order,
            items: typeof result.order.items === 'string' ? JSON.parse(result.order.items) : result.order.items,
            trackingHistory:
              typeof result.order.trackingHistory === 'string'
                ? JSON.parse(result.order.trackingHistory)
                : result.order.trackingHistory,
          };
        }
      } catch (err) {
        console.warn('Backend order API unreachable. Placing order in local offline mode:', err);
      }

      // If server didn't respond (e.g. Netlify static hosting), build order locally
      if (!createdOrder) {
        const localOrderId = `SC-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        createdOrder = {
          id: localOrderId,
          userId,
          userEmail: orderPayload.userEmail,
          userName: orderPayload.userName,
          userPhone: orderPayload.userPhone,
          deliveryAddress: orderPayload.deliveryAddress,
          items: orderPayload.items,
          subtotal: orderPayload.subtotal,
          discount: orderPayload.discount,
          deliveryFee: orderPayload.deliveryFee,
          totalAmount: orderPayload.totalAmount,
          couponCode: orderPayload.couponCode,
          paymentMethod: orderPayload.paymentMethod,
          paymentStatus: 'PAID',
          transactionId: orderPayload.transactionId,
          orderStatus: 'Order Confirmed',
          estimatedDeliveryDate: 'Today within 20 mins',
          deliverySlot: orderPayload.deliverySlot,
          trackingHistory: [
            {
              status: 'Order Placed',
              time: 'Just now',
              description: 'Order placed on SmartCart Express',
              completed: true,
            },
            {
              status: 'Order Confirmed',
              time: 'Just now',
              description: `Payment verified (${orderPayload.transactionId})`,
              completed: true,
            },
            {
              status: 'Processing',
              time: 'In 3 mins',
              description: 'Sent to nearest darkstore fulfillment center',
              completed: false,
            },
            {
              status: 'Packed',
              time: 'In 6 mins',
              description: 'Packed in eco-friendly bag with seal',
              completed: false,
            },
            {
              status: 'Shipped',
              time: 'In 9 mins',
              description: 'Handed over to SmartCart rider',
              completed: false,
            },
            {
              status: 'Out for Delivery',
              time: 'In 12 mins',
              description: 'Rider is on the way to your doorstep',
              completed: false,
            },
            {
              status: 'Delivered',
              time: 'Within 20 mins',
              description: 'Contactless delivery with OTP verification',
              completed: false,
            },
          ],
          refundStatus: 'None',
          refundAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save order to localStorage
        try {
          const existingOrders = JSON.parse(localStorage.getItem('smartcart_orders') || '[]');
          localStorage.setItem('smartcart_orders', JSON.stringify([createdOrder, ...existingOrders]));
        } catch (e) {
          // ignore
        }
      }

      setShowRazorpayModal(false);
      onClose();
      onOrderCompleted(createdOrder);
    } catch (err) {
      console.error('Order creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalConfirmClick = () => {
    if (paymentChoice === 'razorpay') {
      setShowRazorpayModal(true);
    } else {
      handlePlaceOrderWithPayment();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 sm:p-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black">Express Checkout</h2>
              <p className="text-xs text-emerald-100">Step {currentStep} of 6: {STEPS[currentStep - 1]}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between min-w-[500px]">
              {STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isCurrent = currentStep === stepNum;
                const isPassed = currentStep > stepNum;
                return (
                  <button
                    key={step}
                    onClick={() => {
                      if (isPassed) setCurrentStep(stepNum);
                    }}
                    disabled={!isPassed && !isCurrent}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'text-emerald-800'
                        : isPassed
                          ? 'text-emerald-600 hover:text-emerald-800'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isPassed
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isPassed ? '✓' : stepNum}
                    </span>
                    <span>{step.split('. ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Contents */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {/* STEP 1: DELIVERY ADDRESS */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Select Delivery Address
                  </h3>
                  <button
                    onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                </div>

                {showAddAddressForm ? (
                  <form
                    onSubmit={handleSaveNewAddress}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3"
                  >
                    <h4 className="text-xs font-bold text-gray-800">Add New Shipping Address</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-600">Mobile Number</label>
                        <input
                          type="text"
                          required
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">
                        House / Flat / Building / Street
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.addressLine}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-600">State</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-600">Pincode</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-700"
                      >
                        Save & Deliver Here
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(false)}
                        className="bg-gray-200 text-gray-700 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{addr.name}</span>
                            <span className="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-gray-500 font-medium">Contact: {addr.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: REVIEW CART PRODUCTS */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-600" /> Review Grocery Basket ({cart.length} items)
                </h3>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {cart.map((item) => (
                    <div key={item.productId} className="p-3 flex items-center justify-between text-xs gap-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-gray-500">{item.product.brand} • {item.product.quantity}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          Qty: {item.quantity} × ₹{item.product.smartcartPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-gray-900 text-sm">₹{item.subtotal}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Freshness & Quality Guarantee: 100% replacement or instant refund if any product is damaged.</span>
                </div>
              </div>
            )}

            {/* STEP 3: DELIVERY PREFERENCES */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" /> Select Delivery Slot & Instructions
                </h3>

                <div className="space-y-2">
                  {[
                    { slot: 'Standard Express (15-25 Mins)', fee: 'FREE', desc: 'Fastest dispatch from local Bellandur hub' },
                    { slot: 'Scheduled Evening (6:00 PM - 8:00 PM)', fee: 'FREE', desc: 'Arrives right after work' },
                    { slot: 'Tomorrow Morning (7:00 AM - 9:00 AM)', fee: 'FREE', desc: 'Fresh breakfast milk, bread & eggs' },
                  ].map((s) => (
                    <div
                      key={s.slot}
                      onClick={() => setDeliverySlot(s.slot)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        deliverySlot === s.slot
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{s.slot}</p>
                          <p className="text-[11px] text-gray-500">{s.desc}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {s.fee}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-gray-700">Delivery Instructions for Rider</label>
                  <input
                    type="text"
                    value={deliveryInstruction}
                    onChange={(e) => setDeliveryInstruction(e.target.value)}
                    placeholder="e.g. Ring bell, leave with guard, don't ring after 9 PM"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: APPLY COUPONS */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" /> Available SmartCart Coupons
                </h3>

                {appliedCoupon && (
                  <div className="bg-emerald-50 border border-emerald-400 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-emerald-900 text-sm">Coupon {appliedCoupon.code} Applied!</span>
                      <p className="text-emerald-700 mt-0.5">{appliedCoupon.description}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="px-3 py-1 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {[
                    { code: 'SMART50', desc: 'Flat 50% OFF up to ₹100 on orders > ₹199', discount: 50, max: 100, min: 199 },
                    { code: 'FREESHIP', desc: '100% Free Express Delivery across India', discount: 100, max: 29, min: 99 },
                    { code: 'GROCERY20', desc: '20% OFF up to ₹200 on grocery staples', discount: 20, max: 200, min: 499 },
                  ].map((c) => (
                    <div
                      key={c.code}
                      className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between text-xs hover:border-emerald-300"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                            {c.code}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-bold">
                            Save up to ₹{c.max}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">{c.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          applyCoupon({
                            id: 1,
                            code: c.code,
                            discountPercent: c.discount,
                            maxDiscount: c.max,
                            minOrderValue: c.min,
                            description: c.desc,
                            validTill: '2026',
                            isActive: true,
                          })
                        }
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: PAYMENT OPTION */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Select Payment Method
                </h3>

                <div className="space-y-2.5">
                  <div
                    onClick={() => setPaymentChoice('razorpay')}
                    className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                      paymentChoice === 'razorpay'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentChoice"
                      checked={paymentChoice === 'razorpay'}
                      onChange={() => setPaymentChoice('razorpay')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-gray-900 text-sm flex items-center gap-2">
                          ⚡ Razorpay Payment Gateway
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Recommended
                          </span>
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold">Instant Dispatch</span>
                      </div>
                      <p className="text-gray-600">
                        Pay via UPI (GPay, PhonePe, Paytm, QR), Credit/Debit Cards, Net Banking, or Wallets.
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>100% RBI Compliant & Tokenized Security</span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentChoice('cod')}
                    className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                      paymentChoice === 'cod'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentChoice"
                      checked={paymentChoice === 'cod'}
                      onChange={() => setPaymentChoice('cod')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">
                          💵 Cash / UPI on Delivery
                        </span>
                        <span className="text-[11px] text-gray-500 font-semibold">Pay at Doorstep</span>
                      </div>
                      <p className="text-gray-600">
                        Pay with cash or scan delivery partner's QR code when groceries arrive.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: ORDER CONFIRMATION SUMMARY */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-900">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-black text-sm">Everything looks perfect!</p>
                    <p className="text-emerald-700">Review your final order summary before authorizing payment.</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 text-xs border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping to:</span>
                    <span className="font-bold text-gray-900 text-right max-w-xs truncate">
                      {selectedAddress?.name} ({selectedAddress?.addressLine})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Slot:</span>
                    <span className="font-bold text-gray-900">{deliverySlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Mode:</span>
                    <span className="font-bold text-emerald-700">
                      {paymentChoice === 'razorpay' ? 'Razorpay Secure Gateway' : 'Cash on Delivery'}
                    </span>
                  </div>
                </div>

                {/* Final Bill */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2 text-xs">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Final Payable</h4>
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({appliedCoupon?.code || 'COUPON'}):</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge:</span>
                    <span className="font-semibold text-emerald-700">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-black text-gray-900">
                    <span>Total Amount:</span>
                    <span className="text-emerald-700">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Total</span>
                <div className="font-black text-sm text-gray-900">₹{totalAmount}</div>
              </div>

              {currentStep < 6 ? (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinalConfirmClick}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Placing Order...</span>
                  ) : paymentChoice === 'razorpay' ? (
                    <span>Pay ₹{totalAmount} via Razorpay</span>
                  ) : (
                    <span>Confirm Order (COD)</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRazorpayModal && (
        <RazorpayModal
          amount={totalAmount}
          customerName={selectedAddress?.name || user?.displayName || 'SmartCart Customer'}
          customerEmail={user?.email || 'shopper@smartcart.in'}
          customerPhone={selectedAddress?.phone || '+91 98765 43210'}
          onClose={() => setShowRazorpayModal(false)}
          onPaymentSuccess={(paymentData) => {
            handlePlaceOrderWithPayment(paymentData);
          }}
        />
      )}
    </>
  );
};
