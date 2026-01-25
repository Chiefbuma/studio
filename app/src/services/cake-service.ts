import { cakes, specialOfferData, customizationOptions, orders } from '@/lib/data';
import type { Cake, SpecialOffer, CustomizationOptions, Order } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- MOCK API SERVICE ---
// This service simulates API calls by returning mock data from `/src/lib/data.ts`.
// The real API calls are commented out below for easy switching.

export async function getCakes(): Promise<Cake[]> {
  console.log("MOCK: Fetching cakes...");
  await new Promise(resolve => setTimeout(resolve, 50));
  return cakes;
}

/*
// --- REAL API IMPLEMENTATION (Commented Out) ---
export async function getCakes(): Promise<Cake[]> {
  try {
    const res = await fetch(`${API_URL}/cakes`);
    if (!res.ok) {
      throw new Error('Failed to fetch cakes');
    }
    return res.json();
  } catch (error) {
    console.error('[GET_CAKES_ERROR]', error);
    throw error;
  }
}
*/

export async function getSpecialOffer(): Promise<SpecialOffer | null> {
    console.log("MOCK: Fetching special offer...");
    await new Promise(resolve => setTimeout(resolve, 50));
    return specialOfferData;
}

/*
// --- REAL API IMPLEMENTATION (Commented Out) ---
export async function getSpecialOffer(): Promise<SpecialOffer | null> {
    try {
        const res = await fetch(`${API_URL}/special-offer`);
        if (!res.ok) {
            // It's okay to not have a special offer, so we return null instead of throwing
            if (res.status === 404) return null;
            throw new Error('Failed to fetch special offer');
        }
        return res.json();
    } catch (error) {
        console.error('[GET_SPECIAL_OFFER_ERROR]', error);
        return null;
    }
}
*/


export async function getCustomizationOptions(): Promise<CustomizationOptions | null> {
    console.log("MOCK: Fetching customization options...");
    await new Promise(resolve => setTimeout(resolve, 50));
    return customizationOptions;
}

/*
// --- REAL API IMPLEMENTATION (Commented Out) ---
export async function getCustomizationOptions(): Promise<CustomizationOptions | null> {
    try {
        const res = await fetch(`${API_URL}/customizations`);
        if (!res.ok) {
            throw new Error('Failed to fetch customization options');
        }
        return res.json();
    } catch (error) {
        console.error('[GET_CUSTOMIZATIONS_ERROR]', error);
        throw error;
    }
}
*/

export async function getCustomCake(): Promise<Cake | null> {
    console.log("MOCK: Fetching custom cake placeholder...");
    await new Promise(resolve => setTimeout(resolve, 50));
    const customCake = cakes.find(c => c.id === 'custom-cake');
    return customCake || null;
}

/*
// --- REAL API IMPLEMENTATION (Commented Out) ---
export async function getCustomCake(): Promise<Cake | null> {
    try {
        // The custom cake is usually a special case, often fetched with other cakes
        const allCakes = await getCakes();
        return allCakes.find(c => c.id === 'custom-cake') || null;
    } catch (error) {
        console.error('[GET_CUSTOM_CAKE_ERROR]', error);
        return null;
    }
}
*/


export async function getOrders(): Promise<Order[]> {
    console.log("MOCK: Fetching orders...");
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/*
// --- REAL API IMPLEMENTATION (Commented Out) ---
export async function getOrders(): Promise<Order[]> {
    try {
        // This would require authentication
        const res = await fetch(`${API_URL}/orders`, {
            headers: {
                // 'Authorization': `Bearer ${your_auth_token}`
            }
        });
        if (!res.ok) {
            throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        // Sort orders by most recent
        return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
        console.error('[GET_ORDERS_ERROR]', error);
        throw error;
    }
}
*/
