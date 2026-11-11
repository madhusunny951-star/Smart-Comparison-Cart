import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { ShoppingCart, Trash2, Plus, Minus, Tag, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Coupon } from '../types/index.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

const AVAILABLE_COUPONS: Coupon[] = [
  {
    id: 1,
    code: 'SMART50',
    discountPercent: 50,
    maxDiscount: 100,
    minOrderValue: 199,
    description: 'Flat 50% OFF (Up to ₹100) on grocery orders above ₹199',
    validTill: '31 Dec 2026',
    isActive: true,
  },
  {
    id: 2,
    code: 'FREESHIP',
    discountPercent: 100,
    maxDiscount: 29,
    minOrderValue: 99,
    description: 'Free Express Delivery across all SmartCart pin codes',
    validTill: '31 Dec 2026',
    isActive: true,
  },
  {
    id: 3,
    code: 'GROCERY20',
    discountPercent: 20,
    maxDiscount: 200,
    minOrderValue: 499,
    description: '20% OFF up to ₹200 on staples and pantry essentials',
    validTill: '31 Dec 2026',
    isActive: true,
  },
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cart,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    totalAmount,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const handleApplyCustomCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const found = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (!found) {
      setCouponError('Invalid coupon code. Try SMART50 or FREESHIP');
      return;
    }

    if (subtotal < found.minOrderValue) {
      setCouponError(`Min cart value ₹${found.minOrderValue} required for ${found.code}`);
      return;
    }

    applyCoupon(found);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-gray-50 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="font-bold text-lg">My Shopping Cart</h2>
            <span className="bg-emerald-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs">
          {subtotal >= 199 ? (
            <p className="text-emerald-800 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Yay! You unlocked FREE Express Delivery
              (Saved ₹29)
            </p>
          ) : (
            <p className="text-gray-700">
              Add{' '}
              <span className="font-bold text-emerald-700">₹{199 - subtotal}</span> more for{' '}
              <span className="font-bold text-emerald-700">FREE Express Delivery</span>
            </p>
          )}
          <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (subtotal / 199) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Your cart is empty</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Compare prices across Blinkit, Zepto, Swiggy, and Flipkart to add the best deals.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-emerald-700 cursor-pointer"
              >
                Start Grocery Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs font-bold text-gray-500 uppercase">Items in Cart</span>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs flex gap-3 items-center justify-between"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-lg bg-gray-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {item.product.brand} • {item.product.quantity}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-sm font-black text-gray-900">
                        ₹{item.product.smartcartPrice}
                      </span>
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{Math.round(item.product.smartcartPrice * 1.2)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 text-gray-700 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-black text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 text-gray-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Coupons Section */}
              <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs space-y-2.5 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" /> Apply SmartCart Coupon
                  </span>
                  {appliedCoupon && (
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-emerald-800 tracking-wider">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {appliedCoupon.description}
                      </p>
                    </div>
                    <span className="font-black text-emerald-800 text-sm">
                      -₹{discount}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold uppercase focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={handleApplyCustomCoupon}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}

                    {/* Quick Available Coupons Chips */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Available Deals:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_COUPONS.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => applyCoupon(c)}
                            className="text-[11px] font-bold border border-dashed border-emerald-500 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            {c.code} ({c.discountPercent}% OFF)
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Price Breakdown Bill Details (Flipkart-style) */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs space-y-2 text-xs">
                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Bill Summary
                </h4>
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-gray-900">
                  <span>Total Payable</span>
                  <span className="text-base text-emerald-700">₹{totalAmount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Safe and Secure Payments via Razorpay</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout CTA */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-4 shadow-lg flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Amount</div>
              <div className="text-xl font-black text-gray-900">₹{totalAmount}</div>
            </div>
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
