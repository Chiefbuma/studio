
'use server';

import type { OrderPayload, CartItem } from './types';
import pool from '@/lib/db';

/**
 * Places an order by directly saving the data to the database.
 * The server action will save the order with a 'pending' payment status
 * and return the order number and confirmed deposit amount.
 */
export async function placeOrder(payload: OrderPayload): Promise<{ success: boolean; orderNumber: string; error?: string; depositAmount: number }> {
  const { items, deliveryInfo, totalPrice, depositAmount } = payload;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const orderNumber = `WD${Date.now()}`;
    const deliveryDate = deliveryInfo.delivery_date && deliveryInfo.delivery_time 
        ? `${deliveryInfo.delivery_date} ${deliveryInfo.delivery_time}` 
        : deliveryInfo.delivery_date;

    const [orderResult]: any = await connection.query(
        `INSERT INTO orders (
            order_number, customer_name, customer_phone, delivery_method, delivery_address, 
            latitude, longitude, pickup_location, delivery_date, special_instructions, 
            total_price, deposit_amount, payment_status, order_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'processing')`,
        [
            orderNumber,
            deliveryInfo.name,
            deliveryInfo.phone,
            deliveryInfo.delivery_method,
            deliveryInfo.address || null,
            deliveryInfo.coordinates?.lat || null,
            deliveryInfo.coordinates?.lng || null,
            deliveryInfo.pickup_location || null,
            deliveryDate || null,
            deliveryInfo.special_instructions || null,
            totalPrice,
            depositAmount
        ]
    );

    const orderId = orderResult.insertId;

    const itemPromises = items.map((item: CartItem) => {
        return connection.query(
            `INSERT INTO order_items (order_id, cake_id, name, quantity, price, customizations) VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, item.cakeId, item.name, item.quantity, item.price, JSON.stringify(item.customizations || {})]
        );
    });

    await Promise.all(itemPromises);

    await connection.commit();

    return { 
        success: true, 
        orderNumber: orderNumber,
        depositAmount: depositAmount,
    };

  } catch (e) {
    if (connection) await connection.rollback();
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Failed to place order in server action:', e);
    // Return a generic but helpful error message to the client.
    return { success: false, error: 'Could not place your order due to an internal error. Please try again.', orderNumber: '', depositAmount: 0 };
  } finally {
      if (connection) connection.release();
  }
}
