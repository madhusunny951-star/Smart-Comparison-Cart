import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CartItem, Product, Coupon } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  appliedCoupon: Coupon | null;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  discount: 0,
  totalAmount: 0,
  appliedCoupon: null,
  loading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  applyCoupon: () => {},
  removeCoupon: () => {},
  refreshCart: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getAuthHeader } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      const res = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?.uid]);

  const addToCart = async (product: Product, qty = 1) => {
    try {
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      
      const existing = cart.find((item) => item.productId === product.id);
      const newQty = existing ? existing.quantity + qty : qty;

      // Optimistic update
      if (existing) {
        setCart((prev) =>
          prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: newQty, subtotal: product.smartcartPrice * newQty }
              : item
          )
        );
      } else {
        const tempItem: CartItem = {
          id: Date.now(),
          productId: product.id,
          quantity: newQty,
          product,
          subtotal: product.smartcartPrice * newQty,
        };
        setCart((prev) => [...prev, tempItem]);
      }

      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          userId,
          productId: product.id,
          quantity: newQty,
        }),
      });

      await fetchCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';

      if (quantity <= 0) {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.productId === productId
              ? { ...item, quantity, subtotal: item.product.smartcartPrice * quantity }
              : item
          )
        );
      }

      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          userId,
          productId,
          quantity,
        }),
      });

      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      setCart((prev) => prev.filter((item) => item.productId !== productId));

      await fetch(`/api/cart/${productId}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers,
      });
    } catch (err) {
      console.error('Failed to delete cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const headers = await getAuthHeader();
      const userId = user?.uid || 'guest-session';
      setCart([]);
      setAppliedCoupon(null);
      await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers,
      });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const applyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (appliedCoupon?.code === 'FREESHIP') return 0;
    if (subtotal >= 199) return 0; // Free delivery above 199
    return 29;
  }, [subtotal, appliedCoupon]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrderValue) return 0;
    if (appliedCoupon.code === 'FREESHIP') return 29;
    const calc = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    return Math.min(calc, appliedCoupon.maxDiscount);
  }, [subtotal, appliedCoupon]);

  const totalAmount = useMemo(() => {
    if (subtotal === 0) return 0;
    return Math.max(0, subtotal - discount + deliveryFee);
  }, [subtotal, discount, deliveryFee]);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        deliveryFee,
        discount,
        totalAmount,
        appliedCoupon,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
