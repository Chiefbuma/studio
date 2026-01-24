'use client';

import React, { useState, useEffect } from 'react';
import CoverPage from '@/components/cake-paradise/cover-page';
import SpecialOffer from '@/components/cake-paradise/special-offer';
import Menu from '@/components/cake-paradise/menu';
import { CustomizationModal } from '@/components/cake-paradise/customization/customization-modal';
import type { Cake } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CakeSlice } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { CartSheet } from '@/components/cake-paradise/cart-sheet';
import { useCakeData } from '@/hooks/use-cake-data';
import { SocialIcons } from '@/components/cake-paradise/social-icons';
import { CartIcon } from '@/components/cake-paradise/cart-icon';

export default function Home() {
  const [view, setView] = useState<'cover' | 'offer' | 'menu'>('cover');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [isOrderingCustom, setIsOrderingCustom] = useState(false);

  const { cakes, specialOffer, customizationOptions, customCake, loading } = useCakeData();
  const { addToCart } = useCart();

  useEffect(() => {
    if (loading) return;
    const coverTimer = setTimeout(() => {
      if (view === 'cover') {
        setView('offer');
      }
    }, 3000);

    return () => clearTimeout(coverTimer);
  }, [view, loading]);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <Skeleton className="w-16 h-16 rounded-full" />
            <CakeSlice className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/50" />
          </div>
          <p className="text-muted-foreground font-semibold">Loading WhiskeDelights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main>
        <SocialIcons />
        <CartIcon />
        <CartSheet />
        
        {view === 'cover' && <CoverPage />}
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
