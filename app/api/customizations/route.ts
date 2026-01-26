
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
