import type { Cake, SpecialOffer, CustomizationOptions, Order } from '@/lib/types';
import { cakes, specialOfferData, customizationOptions, orders } from '@/lib/data';

// --- MOCK SERVICE ---
// This service simulates fetching data. In a real application, this would
// make API calls to a backend.

const customCake: Cake = {
  id: 'custom-cake',
  name: 'Custom Creation',
  description: 'Design your own cake from scratch. Choose your flavor, size, colors, and toppings to create your perfect dessert.',
  base_price: 1200,
  image_id: 'custom-cake-placeholder',
  rating: 0,
  category: 'Custom',
  orders_count: 0,
  ready_time: '48h+',
  customizable: true,
};

export async function getCakes(): Promise<Cake[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  // Add the special 'custom cake' to the list
  return [customCake, ...cakes];
}

export async function getSpecialOffer(): Promise<SpecialOffer | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return specialOfferData;
}

export async function getCustomizationOptions(): Promise<CustomizationOptions | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return customizationOptions;
}

export function getCustomCake(): Promise<Cake> {
  // This remains a client-side operation as it's a placeholder object.
  return new Promise(resolve => {
    resolve(customCake);
  });
}

export async function getOrders(): Promise<Order[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Sort orders by most recent
    return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}


/*
// --- REAL API SERVICE ---
// In a real application, this would be your base API URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getCakes(): Promise<Cake[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cakes`);
    if (!response.ok) {
      throw new Error('Failed to fetch cakes');
    }
    const data: Cake[] = await response.json();
    return data;
  } catch (error) {
    console.error('[GET_CAKES_ERROR]', error);
    return []; // Return an empty array on error
  }
}

export async function getSpecialOffer(): Promise<SpecialOffer | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/special-offer`);
    if (!response.ok) {
      // It's okay for no special offer to exist, so we don't throw an error for 404.
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch special offer');
    }
    const data: SpecialOffer = await response.json();
    return data;
  } catch (error) {
    console.error('[GET_SPECIAL_OFFER_ERROR]', error);
    return null; // Return null on error
  }
}

export async function getCustomizationOptions(): Promise<CustomizationOptions | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/customizations`);
    if (!response.ok) {
      throw new Error('Failed to fetch customization options');
    }
    const data: CustomizationOptions = await response.json();
    return data;
  } catch (error) {
    console.error('[GET_CUSTOMIZATIONS_ERROR]', error);
    return null; // Return null on error
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn('No auth token found for fetching orders.');
        return [];
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data: Order[] = await response.json();
    return data;
  } catch (error) {
    console.error('[GET_ORDERS_ERROR]', error);
    return []; // Return an empty array on error
  }
}
*/
