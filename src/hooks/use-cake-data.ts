
import { useState, useEffect } from 'react';
import type { Cake, CustomizationOptions, SpecialOffer } from '@/lib/types';
import { getCakes, getSpecialOffer, getCustomizationOptions, getCustomCake } from '@/services/cake-service';

interface CakeData {
  cakes: Cake[];
  specialOffer: SpecialOffer | null;
  customizationOptions: CustomizationOptions | null;
  customCake: Cake | null;
  loading: boolean;
}

export function useCakeData(): CakeData {
  const [data, setData] = useState<Omit<CakeData, 'loading'>>({
    cakes: [],
    specialOffer: null,
    customizationOptions: null,
    customCake: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cakes, specialOffer, customizationOptions, customCake] = await Promise.all([
          getCakes(),
          getSpecialOffer(),
          getCustomizationOptions(),
          getCustomCake()
        ]);
        setData({ cakes, specialOffer, customizationOptions, customCake });
      } catch (error) {
        console.error("Failed to fetch cake data:", error);
        // Handle error state if necessary
      } finally {
        // A short delay to show the loading screen
        setTimeout(() => setLoading(false), 500);
      }
    }

    fetchData();
  }, []);

  return { ...data, loading };
}
