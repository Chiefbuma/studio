
'use server';

import type { OrderPayload } from './types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

/**
 * Places an order by sending the data to the backend API.
 * The backend is expected to save the order with a 'pending' payment status
 * and return the order number and confirmed deposit amount.
 */
export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  try {
    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to place order.' }));
        throw new Error(errorData.message || 'Failed to place order.');
    }
    
    const result = await response.json();

    return {
        success: true,
        orderNumber: result.orderNumber,
        depositAmount: result.depositAmount,
    };

  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Failed to place order:', error);
    return { success: false, error, orderNumber: '', depositAmount: 0 };
  }
}
