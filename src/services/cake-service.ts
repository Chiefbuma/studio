import { cakes, specialOfferData, customizationOptions, orders } from '@/lib/data';
import type { Cake, SpecialOffer, CustomizationOptions, Order } from '@/lib/types';

// --- MOCK API SERVICE ---
// This service simulates API calls by returning mock data from `/src/lib/data.ts`.

export async function getCakes(): Promise<Cake[]> {
  console.log("Mock Service: Fetching cakes...");
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return cakes;
}

export async function getSpecialOffer(): Promise<SpecialOffer | null> {
  console.log("Mock Service: Fetching special offer...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return specialOfferData;
}

export async function getCustomizationOptions(): Promise<CustomizationOptions | null> {
  console.log("Mock Service: Fetching customization options...");
  await new Promise(resolve => setTimeout(resolve, 100));
  return customizationOptions;
}

export async function getCustomCake(): Promise<Cake | null> {
    console.log("Mock Service: Fetching custom cake placeholder...");
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
        id: 'custom-cake',
        name: 'Custom Creation',
        description: 'Design your own cake from scratch...',
        base_price: 1200.00,
        image_id: 'custom-cake-placeholder',
        rating: 0,
        category: 'Custom',
        orders_count: 0,
        ready_time: '48h+',
        customizable: true
    };
}

export async function getOrders(): Promise<Order[]> {
  console.log("Mock Service: Fetching orders...");
  await new Promise(resolve => setTimeout(resolve, 100));
  // Sort orders by most recent
  return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}