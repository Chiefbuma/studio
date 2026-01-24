import { cakes, specialOffer, customizationOptions, customCake } from '@/lib/data';
import type { Cake, SpecialOffer, CustomizationOptions } from '@/lib/types';

// This service simulates fetching data. In a real application, these functions
// would make API calls to a backend.

export function getCakes(): Promise<Cake[]> {
  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(cakes);
    }, 500);
  });
}

export function getSpecialOffer(): Promise<SpecialOffer> {
  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(specialOffer);
    }, 500);
  });
}

export function getCustomizationOptions(): Promise<CustomizationOptions> {
    // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(customizationOptions);
    }, 500);
  });
}

export function getCustomCake(): Promise<Cake> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(customCake);
        }, 100);
    });
}
