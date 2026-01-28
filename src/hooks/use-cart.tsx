'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Cake, CartItem, Customizations, DeliveryInfo } from '@/lib/types';
import { useToast } from './use-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (cake: Cake, quantity: number, price: number, customizations?: Customizations) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCheckoutData: () => void;
  itemCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  deliveryInfo: DeliveryInfo | null;
  setDeliveryInfo: (info: DeliveryInfo) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('whiskedelights-cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      const storedDeliveryInfo = localStorage.getItem('whiskedelights-delivery-info');
      if (storedDeliveryInfo) {
        setDeliveryInfo(JSON.parse(storedDeliveryInfo));
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('whiskedelights-cart', JSON.stringify(cart));
      if (deliveryInfo) {
        localStorage.setItem('whiskedelights-delivery-info', JSON.stringify(deliveryInfo));
      } else {
        localStorage.removeItem('whiskedelights-delivery-info');
      }
    } catch (error) {
      console.error("Failed to save data to local storage", error);
    }
  }, [cart, deliveryInfo]);

  const addToCart = (cake: Cake, quantity: number, price: number, customizations?: Customizations) => {
    setCart(prevCart => {
      // If the item is the non-customizable special offer, check if it already exists and update quantity.
      if (cake.id === 'special-offer-cake' && !customizations) {
          const existingItemIndex = prevCart.findIndex(item => item.cakeId === cake.id && !item.customizations);
          if (existingItemIndex > -1) {
              const newCart = [...prevCart];
              newCart[existingItemIndex].quantity += quantity;
              
              setTimeout(() => toast({
                title: "Cart Updated!",
                description: `Quantity for ${cake.name} is now ${newCart[existingItemIndex].quantity}.`,
              }), 0);
              
              return newCart;
          }
      }
      
      const newItem: CartItem = {
        id: `${cake.id}-${Date.now()}`,
        cakeId: cake.id,
        name: cake.name,
        quantity,
        price,
        image_data_uri: cake.image_data_uri,
        customizations,
      };

      setTimeout(() => toast({
        title: "Added to Cart!",
        description: `${quantity} x ${cake.name} added.`,
      }), 0);

      return [...prevCart, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    setTimeout(() => toast({
        variant: 'destructive',
        title: "Item Removed",
        description: `Item has been removed from your cart.`,
      }), 0);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart => {
          return prevCart.map(item => (item.id === itemId ? { ...item, quantity } : item));
      });
    }
  };

  const clearCheckoutData = () => {
    setCart([]);
    setDeliveryInfo(null);
  };

  const itemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const totalPrice = useMemo(() => cart.reduce((total, item) => total + (item.price * item.quantity), 0), [cart]);
  
  const value = { 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCheckoutData, 
      itemCount, 
      totalPrice, 
      isCartOpen, 
      setIsCartOpen,
      deliveryInfo,
      setDeliveryInfo,
  };
  
  return (
    <CartContext.Provider value={value}>
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
