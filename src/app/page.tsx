'use client';

import React, { useState, useEffect } from 'react';
import CoverPage from '@/components/cake-paradise/cover-page';
import SpecialOffer from '@/components/cake-paradise/special-offer';
import Menu from '@/components/cake-paradise/menu';
import { CustomizationModal } from '@/components/cake-paradise/customization/customization-modal';
import type { Cake, CustomizationOptions } from '@/lib/types';
import { cakes as allCakes, specialOffer as mockSpecialOffer, customizationOptions as mockCustomizationOptions, customCake } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { CakeSlice } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'cover' | 'offer' | 'menu'>('cover');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [isOrderingCustom, setIsOrderingCustom] = useState(false);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [specialOffer, setSpecialOffer] = useState<any>(null);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setCakes(allCakes);
      setSpecialOffer(mockSpecialOffer);
      setCustomizationOptions(mockCustomizationOptions);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    // After data loads, transition from cover to offer page
    const coverTimer = setTimeout(() => {
      if (view === 'cover') {
        setView('offer');
      }
    }, 3000);

    return () => clearTimeout(coverTimer);
  }, [view, loading]);

  const handleOrder = (cake: Cake) => {
    setSelectedCake(cake);
    setIsOrderingCustom(false);
    setShowOrderModal(true);
  };
  
  const handleOrderCustom = () => {
    setSelectedCake(customCake);
    setIsOrderingCustom(true);
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
    setIsOrderingCustom(false);
    // Delay clearing selected cake to allow for exit animation
    setTimeout(() => {
      setSelectedCake(null);
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
          <p className="text-muted-foreground font-semibold">Loading Cake Paradise...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {view === 'cover' && <CoverPage />}
      {view === 'offer' && (
        <SpecialOffer
          specialOffer={specialOffer}
          onOrder={handleOrder}
          onOrderCustom={handleOrderCustom}
          onNavigateToMenu={handleNavigateToMenu}
        />
      )}
      {view === 'menu' && (
        <Menu
          cakes={cakes}
          onOrder={handleOrder}
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
  );
}
