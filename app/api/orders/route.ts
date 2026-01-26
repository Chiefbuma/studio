import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';
import type { CartItem } from '@/lib/types';

export async function GET(req: NextRequest) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    try {
        const connection = await pool.getConnection();
        const [orders]: any[] = await connection.query('SELECT * FROM orders ORDER BY created_at DESC');

        for (const order of orders) {
            const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            order.items = items;
        }
        
        connection.release();
        return NextResponse.json(orders);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('API Error (GET /orders):', error);
        return NextResponse.json({ message: `Failed to fetch orders: ${message}` }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    try {
        const { items, deliveryInfo, totalPrice, depositAmount } = await req.json();
        
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
        
        return NextResponse.json({ 
            success: true, 
            orderNumber: orderNumber,
            depositAmount: depositAmount 
        }, { status: 201 });

    } catch (error) {
        await connection.rollback();
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('API Error (POST /orders):', error);
        return NextResponse.json({ message: `Failed to place order: ${message}` }, { status: 500 });
    } finally {
        connection.release();
    }
}
