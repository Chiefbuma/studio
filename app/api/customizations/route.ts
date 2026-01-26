
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const parsePrices = (items: any[]) => {
    return items.map(item => ({
        ...item,
        price: item.price !== undefined ? parseFloat(item.price) : 0,
    }));
};

export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [flavors] = await connection.query('SELECT * FROM flavors ORDER BY price ASC');
        const [sizes] = await connection.query('SELECT * FROM sizes ORDER BY price ASC');
        const [colors] = await connection.query('SELECT * FROM colors ORDER BY price ASC');
        const [toppings] = await connection.query('SELECT * FROM toppings ORDER BY price ASC');
        connection.release();

        return NextResponse.json({
            flavors: parsePrices(flavors as any[]),
            sizes: parsePrices(sizes as any[]),
            colors: parsePrices(colors as any[]),
            toppings: parsePrices(toppings as any[]),
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('API Error (GET /customizations):', error);
        return NextResponse.json({ message: `Failed to fetch customization options: ${message}` }, { status: 500 });
    }
}
