import React from 'react';
import { Product, PlatformComparison } from '../types/index.ts';
import { PlatformBadge } from './PlatformBadge.tsx';
import { ExternalLink, CheckCircle, Clock, Truck, Tag, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface ComparisonModalProps {
  product: Product;
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const comparisons = product.comparisons || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border-2 border-white/30 bg-white"
            />
            <div>
              <span className="text-[11px] uppercase tracking-wider bg-emerald-700 text-emerald-100 font-bold px-2 py-0.5 rounded-md">
                {product.brand} • {product.quantity}
              </span>
              <h2 className="text-lg sm:text-xl font-bold mt-1 text-white leading-tight">
                {product.name}
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Multi-Platform Price Comparison across 6 major Indian grocery platforms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-emerald-700/50 text-xl font-bold leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Official Shopping Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="text-base">ℹ️</span>
            <div>
              <p className="font-bold">Official Store Redirection Policy:</p>
              <p className="text-amber-800 mt-0.5">
                When you click <strong>View on Official Website</strong>, you will be redirected to the
                official shopping portal of that platform (e.g., Blinkit, Zepto, Swiggy Instamart,
                BigBasket, DMart, or Flipkart). That platform handles checkout, payment, and delivery.
                Alternatively, choose <strong>Buy on SmartCart</strong> for direct 15-min delivery and
                order management.
              </p>
            </div>
          </div>

          {/* SmartCart Direct Shopping Option Highlight */}
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PlatformBadge platformName="SmartCart" size="md" />
                <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  ⚡ SmartCart Direct Express
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-gray-900">₹{product.smartcartPrice}</span>
                <span className="text-xs text-gray-400 line-through">
                  ₹{Math.round(product.smartcartPrice * 1.2)}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {product.smartcartDiscount}% OFF
                </span>
              </div>
              <div className="text-xs text-gray-600 flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-emerald-800">
                  <Clock className="w-3.5 h-3.5" /> {product.smartcartDeliveryTime}
                </span>
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <Truck className="w-3.5 h-3.5" /> FREE on orders &gt; ₹199
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  addToCart(product);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <ShoppingCart className="w-4 h-4" /> Add to SmartCart
              </button>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs text-gray-500">
              Live Prices from Official Platforms
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {comparisons.map((c) => (
                <div
                  key={c.platformName}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all bg-white relative ${
                    c.isLowest
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 shadow-xs'
                  }`}
                >
                  {c.isLowest && (
                    <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Lowest Price
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <PlatformBadge platformName={c.platformName} size="sm" />
                      <span
                        className={`text-[11px] font-bold ${
                          c.inStock ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {c.inStock ? '● In Stock' : '● Out of Stock'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">₹{c.price}</span>
                      <span className="text-xs text-gray-400 line-through">₹{c.originalPrice}</span>
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        {c.discountPercent}% OFF
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-2.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Truck className="w-3.5 h-3.5" /> Delivery Fee:
                        </span>
                        <span className="font-semibold text-gray-800">
                          {c.deliveryFee === 0 ? 'FREE' : `₹${c.deliveryFee}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3.5 h-3.5" /> Delivery Time:
                        </span>
                        <span className="font-semibold text-gray-800">{c.deliveryTime}</span>
                      </div>
                      {c.offerText && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50/80 px-2 py-1 rounded-md">
                          <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">{c.offerText}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <a
                      href={c.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gray-900 hover:bg-black text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View on Official {c.platformName}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-between items-center text-xs text-gray-500">
          <span>* Prices are updated dynamically from verified official platform catalogs.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
