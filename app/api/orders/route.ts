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

// The POST handler has been removed. The logic for creating an order is now
// handled directly in the 'placeOrder' server action for better reliability
// and performance, especially in production environments.
