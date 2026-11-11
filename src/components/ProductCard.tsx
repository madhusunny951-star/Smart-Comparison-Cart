import React, { useState } from 'react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { PlatformBadge } from './PlatformBadge.tsx';
import { ComparisonModal } from './ComparisonModal.tsx';
import { Star, ShoppingCart, Plus, Minus, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [showComparison, setShowComparison] = useState(false);

  const cartItem = cart.find((item) => item.productId === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const comparisons = product.comparisons || [];
  // Find lowest price among comparisons and SmartCart
  let lowest = product.smartcartPrice;
  let lowestPlatform = 'SmartCart';
  comparisons.forEach((c) => {
    if (c.price < lowest) {
      lowest = c.price;
      lowestPlatform = c.platformName;
    }
  });

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group">
        {/* Top Product Image & Badges */}
        <div className="relative p-4 pb-0">
          <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Discount Badge */}
            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
              {product.smartcartDiscount}% OFF
            </span>

            {/* Rating */}
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-gray-800 text-[11px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-gray-100">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{product.rating}</span>
              <span className="text-gray-400 font-normal">({product.ratingCount})</span>
            </div>
          </div>

          {/* Lowest Price Banner */}
          <div className="mt-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] px-2.5 py-1 rounded-lg flex items-center justify-between font-medium">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-amber-600" /> Best Price:
            </span>
            <span className="font-extrabold text-gray-900">
              ₹{lowest}{' '}
              <span className="text-[10px] font-medium text-amber-700">on {lowestPlatform}</span>
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 pt-2 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>{product.brand}</span>
              <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                {product.quantity}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Quick Platform Comparison Preview Pill Row */}
          <div className="space-y-1.5 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-medium">Compare 6 platforms:</span>
              <button
                onClick={() => setShowComparison(true)}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {comparisons.slice(0, 4).map((c) => (
                <a
                  key={c.platformName}
                  href={c.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-[10px] flex items-center gap-1 text-gray-700 transition-colors cursor-pointer"
                  title={`View on official ${c.platformName}: ₹${c.price}`}
                >
                  <span className="font-semibold">{c.platformName.split(' ')[0]}:</span>
                  <span className="font-bold text-gray-900">₹{c.price}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* SmartCart Direct Price & Cart Action */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                SmartCart Direct
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900">₹{product.smartcartPrice}</span>
                <span className="text-xs text-gray-400 line-through">
                  ₹{Math.round(product.smartcartPrice * 1.2)}
                </span>
              </div>
            </div>

            {qtyInCart === 0 ? (
              <button
                onClick={() => addToCart(product, 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Add
              </button>
            ) : (
              <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                  className="px-2 py-1.5 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 text-xs font-black text-emerald-900">{qtyInCart}</span>
                <button
                  onClick={() => updateQuantity(product.id, qtyInCart + 1)}
                  className="px-2 py-1.5 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showComparison && (
        <ComparisonModal product={product} onClose={() => setShowComparison(false)} />
      )}
    </>
  );
};
