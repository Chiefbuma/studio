'use server';

import type { OrderPayload } from './types';

export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  console.log('Placing order with payload:', JSON.stringify(payload, null, 2));

  // Simulate database insertion and order number generation
  try {
    // In a real app, you would save the order (with all its items) to a database
    // and get a real order number.
    const orderNumber = `CP-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Order ${orderNumber} placed successfully with ${payload.items.length} items.`);

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
