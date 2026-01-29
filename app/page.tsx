'use client';

import React, { useState, useEffect } from 'react';
import SpecialOffer from '@/components/cake-paradise/special-offer';
import Menu from '@/components/cake-paradise/menu';
import { CustomizationModal } from '@/components/cake-paradise/customization/customization-modal';
import type { Cake } from '@/lib/types';
import { CakeSlice } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { CartSheet } from '@/components/cake-paradise/cart-sheet';
import { useCakeData } from '@/hooks/use-cake-data';
import { SocialIcons } from '@/components/cake-paradise/social-icons';
import { CartIcon } from '@/components/cake-paradise/cart-icon';

export default function Home() {
  const [view, setView] = useState<'offer' | 'menu'>('offer');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [isOrderingCustom, setIsOrderingCustom] = useState(false);

  const { cakes, specialOffer, customizationOptions, customCake, loading } = useCakeData();
  const { addToCart } = useCart();

  // Handler for adding the non-customizable special offer cake directly to the cart.
  const handleOrderSpecialOffer = (cake: Cake) => {
    if (!specialOffer) return;
    // The price is the special price, not the base price.
    addToCart(cake, 1, specialOffer.special_price);
  };
  
  // Handler to open the customization modal for any cake.
  const handleOpenCustomizationModal = (cake: Cake, isCustom: boolean) => {
      if (!customizationOptions) {
          console.error("Customization options not loaded.");
          return;
      }
      setSelectedCake(cake);
      setIsOrderingCustom(isCustom);
      setShowOrderModal(true);
  };

  const handleNavigateToMenu = () => {
    setView('menu');
  };

  const handleNavigateToHome = () => {
    setView('offer');
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    // Delay resetting the cake to allow for the closing animation
    setTimeout(() => {
      setSelectedCake(null);
      setIsOrderingCustom(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-4">
        <div className="flex items-center gap-2 font-bold text-3xl text-primary mb-6 font-headline">
            <CakeSlice className="h-8 w-8" />
            <span>WhiskeDelights</span>
        </div>
        <div className="flex items-center justify-center space-x-2" aria-label="Loading">
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
        </div>
        <p className="text-muted-foreground mt-6 font-semibold">Loading deliciousness...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main>
        <SocialIcons />
        <CartIcon />
        <CartSheet />
        
        {view === 'offer' && (
          <SpecialOffer
            specialOffer={specialOffer}
            onOrder={handleOrderSpecialOffer}
            onOrderCustom={() => customCake && handleOpenCustomizationModal(customCake, true)}
            onNavigateToMenu={handleNavigateToMenu}
          />
        )}
        {view === 'menu' && (
          <Menu
            cakes={cakes.filter(c => c.id !== 'custom-cake')}
            onOrder={(cake) => handleOpenCustomizationModal(cake, false)}
            onBack={handleNavigateToHome}
          />
        )}

        {selectedCake && customizationOptions && (
          <CustomizationModal
            cake={selectedCake}
            isOpen={showOrderModal}
            onClose={handleCloseModal}
            customizationOptions={customizationOptions}
            isCustom={isOrderingCustom}
          />
        )}
      </main>
    </div>
  );
}
