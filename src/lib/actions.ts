'use server';

import type { OrderPayload } from './types';

// const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  console.log('Placing order with payload:', JSON.stringify(payload, null, 2));

  // Specifically log coordinates if they exist
  if (payload.deliveryInfo.coordinates) {
    console.log('Coordinates received:', payload.deliveryInfo.coordinates);
  }

  /*
  // --- REAL API ORDER PLACEMENT ---
  // UNCOMMENT THIS BLOCK TO USE A REAL API
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to place order.');
    }

    const { orderNumber, depositAmount } = await response.json();
    console.log(`Order ${orderNumber} placed successfully via API.`);
    
    return {
        success: true,
        orderNumber,
        depositAmount
    };

  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Failed to place order:', error);
    return { success: false, error, orderNumber: '', depositAmount: 0 };
  }
  */

  // --- MOCK ORDER PLACEMENT (Current) ---
  try {
    // In a real app, you would save the order (with all its items) to a database
    // and get a real order number.
    const orderNumber = `WD-${Math.floor(Math.random() * 90000) + 10000}`;
    
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
