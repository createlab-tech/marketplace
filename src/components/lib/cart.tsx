import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (modelId: string) => void;
  clearCart: () => void;
  isInCart: (modelId: string) => boolean;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('createlab_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('createlab_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.modelId === item.modelId)) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (modelId: string) => {
    setItems((prev) => prev.filter((i) => i.modelId !== modelId));
  };

  const clearCart = () => setItems([]);

  const isInCart = (modelId: string) => items.some((i) => i.modelId === modelId);

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
