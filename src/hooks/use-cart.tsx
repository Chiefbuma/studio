
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Cake, CartItem, Customizations, DeliveryInfo } from '@/lib/types';
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
  deliveryInfo: DeliveryInfo | null;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  clearCheckoutData: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('whiskedelights-cart');
      if (storedCart) setCart(JSON.parse(storedCart));
      
      const storedInfo = sessionStorage.getItem('whiskedelights-delivery-info');
      if (storedInfo) setDeliveryInfo(JSON.parse(storedInfo));

    } catch (error) {
      console.error("Failed to load cart/delivery info from storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('whiskedelights-cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to local storage", error);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (deliveryInfo) {
        sessionStorage.setItem('whiskedelights-delivery-info', JSON.stringify(deliveryInfo));
      } else {
        sessionStorage.removeItem('whiskedelights-delivery-info');
      }
    } catch (error) {
        console.error("Failed to save delivery info to session storage", error);
    }
  }, [deliveryInfo]);


  const addToCart = (cake: Cake, quantity: number, price: number, customizations?: Customizations) => {
    setCart(prevCart => {
      if (!cake.customizable && !customizations) {
          const existingItemIndex = prevCart.findIndex(item => item.cakeId === cake.id && !item.customizations);
          if (existingItemIndex > -1) {
              const newCart = [...prevCart];
              newCart[existingItemIndex].quantity += quantity;
              
              setTimeout(() => toast({
                title: "Cart Updated!",
                description: `Quantity for ${cake.name} is now ${newCart[existingItemIndex].quantity}.`,
              }), 0);
              
              setIsCartOpen(true);
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

  const clearCart = () => {
    setCart([]);
  };
  
  const clearCheckoutData = () => {
      setCart([]);
      setDeliveryInfo(null);
      localStorage.removeItem('whiskedelights-cart');
      sessionStorage.removeItem('whiskedelights-delivery-info');
  }

  const itemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((total, item) => total + (item.price * item.quantity), 0), [cart]);
  
  const value = { 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      itemCount, 
      totalPrice, 
      isCartOpen, 
      setIsCartOpen,
      deliveryInfo,
      setDeliveryInfo,
      clearCheckoutData,
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
