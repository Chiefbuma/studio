'use server';

import type { OrderPayload } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Places an order in the system with a 'pending' payment status.
 * In a real application, a separate, secure backend process (like a webhook handler)
 * would be responsible for verifying the payment and updating the status to 'paid'.
 */
export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  console.log('Placing order with payload:', JSON.stringify(payload, null, 2));

  // Specifically log coordinates if they exist
  if (payload.deliveryInfo.coordinates) {
    console.log('Coordinates received:', payload.deliveryInfo.coordinates);
  }

  // --- REAL API IMPLEMENTATION ---
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // The backend will use this to create the order
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to place order.');
    }

    // The API returns the new order number and the calculated deposit amount
    const { orderNumber, depositAmount } = await response.json();
    console.log(`Order ${orderNumber} placed successfully via API with pending payment.`);
    
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
}
