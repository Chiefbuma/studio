'use server';

import type { OrderPayload } from './types';
import { personalizedCakeRecommendations as personalizedCakeRecommendationsFlow } from '@/ai/flows/personalized-cake-recommendations';

export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  console.log('Placing order with payload:', JSON.stringify(payload, null, 2));

  // Simulate database insertion and order number generation
  try {
    // In a real app, you would save the order to a database
    // and get a real order number.
    const orderNumber = `CP-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Order ${orderNumber} placed successfully.`);

    return { 
      success: true, 
      orderNumber,
      depositAmount: payload.depositAmount
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Failed to place order:', error);
    return { success: false, error, orderNumber: '', depositAmount: 0 };
  }
}

// User history is hardcoded for demonstration purposes.
// In a real application, this would be fetched for the logged-in user.
const MOCK_USER_ORDER_HISTORY = JSON.stringify([
  { cake: "Chocolate Fudge Bliss", date: "2024-05-10" },
  { cake: "Red Velvet Delight", date: "2024-03-22" },
  { cake: "Whiskey Delight", date: "2024-01-15" },
]);

export async function personalizedCakeRecommendations(): Promise<{ success: boolean; data?: string[]; error?: string }> {
  console.log('Getting personalized cake recommendations...');
  try {
    const result = await personalizedCakeRecommendationsFlow({
      userOrderHistory: MOCK_USER_ORDER_HISTORY,
    });

    if (result.recommendations) {
      return { success: true, data: result.recommendations };
    } else {
      return { success: false, error: 'Could not generate recommendations.' };
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('AI Recommendation Error:', error);
    return { success: false, error: 'Failed to connect to the recommendation service.' };
  }
}
