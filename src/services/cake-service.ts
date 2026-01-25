import type { Cake, SpecialOffer, CustomizationOptions, Order } from '@/lib/types';

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

export async function getCustomCake(): Promise<Cake | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/cakes/custom-cake`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch custom cake placeholder');
        }
        return await response.json();
    } catch (error) {
        console.error('[GET_CUSTOM_CAKE_ERROR]', error);
        return null;
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
    // Sort orders by most recent
    return [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('[GET_ORDERS_ERROR]', error);
    return []; // Return an empty array on error
  }
}
