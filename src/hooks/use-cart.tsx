'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Cake, CartItem, Customizations } from '@/lib/types';
import { useToast } from './use-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (cake: Cake, quantity: number, price: number, customizations?: Customizations) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('whiskedelights-cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('whiskedelights-cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to local storage", error);
    }
  }, [cart]);

  const addToCart = (cake: Cake, quantity: number, price: number, customizations?: Customizations) => {
    setCart(prevCart => {
      // If the item is the non-customizable special offer, check if it already exists and update quantity.
      if (cake.id === 'special-offer-cake' && !customizations) {
          const existingItemIndex = prevCart.findIndex(item => item.cakeId === cake.id && !item.customizations);
          if (existingItemIndex > -1) {
              const newCart = [...prevCart];
              newCart[existingItemIndex].quantity += quantity;
              
              toast({
                title: "Cart Updated!",
                description: `Quantity for ${cake.name} is now ${newCart[existingItemIndex].quantity}.`,
              });
              setIsCartOpen(true);
              
              return newCart;
          }
      }
      
      // For all other cakes (including customized ones), add as a new unique item.
      const newItem: CartItem = {
        id: `${cake.id}-${Date.now()}`,
        cakeId: cake.id,
        name: cake.name,
        quantity,
        price,
        image_id: cake.image_id,
        customizations,
      };

      toast({
        title: "Added to Cart!",
        description: `${quantity} x ${cake.name} added.`,
      });
      setIsCartOpen(true);

      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    toast({
        variant: 'destructive',
        title: "Item Removed",
        description: `Item has been removed from your cart.`,
      });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(prevCart => {
        if (quantity <= 0) {
            return prevCart.filter(item => item.id !== itemId);
        }
        return prevCart.map(item => (item.id === itemId ? { ...item, quantity } : item));
    });
  };

  const clearCart = () => {
    setCart([]);
    toast({
        title: "Cart Cleared",
        description: `Your cart is now empty.`,
      });
  };

  const itemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const totalPrice = useMemo(() => cart.reduce((total, item) => total + (item.price * item.quantity), 0), [cart]);
  
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
