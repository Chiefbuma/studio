import { cakes, specialOffer, customizationOptions, customCake, orders } from '@/lib/data';
import type { Cake, SpecialOffer, CustomizationOptions, Order } from '@/lib/types';

// In a real application, this would be your base API URL.
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// --- EXAMPLE: REAL API FETCHING ---
// The functions below are examples of how you would fetch data from a real backend API.
// To switch, you would comment out the mock data logic and uncomment the fetch logic.

export async function getCakes(): Promise<Cake[]> {
  /*
  // UNCOMMENT THIS BLOCK TO USE A REAL API
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
  */

  // --- MOCK DATA LOGIC (Current) ---
  console.log('Fetching cakes from mock data...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(cakes);
    }, 500);
  });
}

export async function getSpecialOffer(): Promise<SpecialOffer | null> {
  /*
  // UNCOMMENT THIS BLOCK TO USE A REAL API
  try {
    const response = await fetch(`${API_BASE_URL}/special-offer`);
    if (!response.ok) {
      throw new Error('Failed to fetch special offer');
    }
    const data: SpecialOffer = await response.json();
    return data;
  } catch (error) {
    console.error('[GET_SPECIAL_OFFER_ERROR]', error);
    return null; // Return null on error
  }
  */

  // --- MOCK DATA LOGIC (Current) ---
  console.log('Fetching special offer from mock data...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(specialOffer);
    }, 500);
  });
}

export async function getCustomizationOptions(): Promise<CustomizationOptions | null> {
  /*
  // UNCOMMENT THIS BLOCK TO USE A REAL API
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
  */
    
  // --- MOCK DATA LOGIC (Current) ---
  console.log('Fetching customizations from mock data...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(customizationOptions);
    }, 500);
  });
}

export function getCustomCake(): Promise<Cake> {
  // This typically remains a client-side or mock operation as it's a placeholder.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(customCake);
    }, 100);
  });
}

export async function getOrders(): Promise<Order[]> {
  /*
  // UNCOMMENT THIS BLOCK TO USE A REAL API
  try {
    // You would typically include an auth token here
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        // 'Authorization': `Bearer ${your_auth_token}`
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
  */

  // --- MOCK DATA LOGIC (Current) ---
  console.log('Fetching orders from mock data...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(orders);
    }, 500);
  });
}