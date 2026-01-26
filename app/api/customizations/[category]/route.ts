import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

const allowedCategories = ['flavors', 'sizes', 'colors', 'toppings'];

export async function POST(req: NextRequest, { params }: { params: { category: string } }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { category } = params;
    if (!allowedCategories.includes(category)) {
        return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { id } = body;
        // This is a generic handler, so it relies on the frontend sending the correct properties.
        const columns = Object.keys(body).filter(key => body[key] !== undefined && body[key] !== null);
        const values = columns.map(col => body[col]);
        const placeholders = columns.map(() => '?').join(', ');
        
        const connection = await pool.getConnection();
        await connection.query(
            `INSERT INTO \`${category}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
            values
        );
        
        const [newItemRows]:any[] = await connection.query(`SELECT * FROM \`${category}\` WHERE id = ?`, [id]);
        connection.release();

        if (newItemRows.length === 0) {
            return NextResponse.json({ message: `Failed to create item in ${category}`}, { status: 500 });
        }

        const newItem = newItemRows[0];
         if (newItem.price) {
            newItem.price = parseFloat(newItem.price);
        }

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(`API Error (POST /customizations/${category}):`, error);
        return NextResponse.json({ message: 'Failed to create item' }, { status: 500 });
    }
}
