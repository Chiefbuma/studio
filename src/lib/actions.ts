'use server';

import type { OrderPayload } from './types';

/**
 * MOCK ACTION: Simulates placing an order.
 * In a real application, this server action would call a backend API
 * to save the order to a database with a 'pending' payment status.
 */
export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  console.log('Simulating placing order with payload:', JSON.stringify(payload, null, 2));

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // Generate a mock order number
    const orderNumber = `WD-MOCK-${Math.floor(Math.random() * 9000) + 1000}`;
    
    console.log(`Mock order ${orderNumber} created successfully.`);

    // In a real app, the deposit amount would be validated/calculated on the backend.
    // Here we just pass it through from the payload.
    return {
        success: true,
        orderNumber,
        depositAmount: payload.depositAmount,
    };

  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Failed to place mock order:', error);
    return { success: false, error, orderNumber: '', depositAmount: 0 };
  }
}