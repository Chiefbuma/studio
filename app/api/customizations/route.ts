
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

    } catch (error: any) {
        console.error('API Error (GET /customizations):', error);
        let message = 'Failed to fetch customization options due to a server error.';
        if (error.code === 'ER_NO_SUCH_TABLE') {
            message = 'Database setup incomplete: One or more customization tables were not found. Please ensure you have run the SQL scripts in the README.md file.';
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            message = 'Database connection error: Could not connect to the database server. Please ensure the Docker environment is running correctly.';
        }
        return NextResponse.json({ message: message }, { status: 500 });
    }
}
