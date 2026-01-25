import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [flavors] = await connection.query('SELECT * FROM flavors ORDER BY price ASC');
        const [sizes] = await connection.query('SELECT * FROM sizes ORDER BY price ASC');
        const [colors] = await connection.query('SELECT * FROM colors ORDER BY price ASC');
        const [toppings] = await connection.query('SELECT * FROM toppings ORDER BY price ASC');
        connection.release();

        return NextResponse.json({
            flavors,
            sizes,
            colors,
            toppings,
        });

    } catch (error) {
        console.error('API Error (GET /customizations):', error);
        return NextResponse.json({ message: 'Failed to fetch customization options' }, { status: 500 });
    }
}
