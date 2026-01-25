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
        // This is a generic handler, so it relies on the frontend sending the correct properties.
        const columns = Object.keys(body).filter(key => body[key] !== undefined && body[key] !== null);
        const values = columns.map(col => body[col]);
        const placeholders = columns.map(() => '?').join(', ');
        
        const connection = await pool.getConnection();
        const [result]: any = await connection.query(
            `INSERT INTO \`${category}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
            values
        );
        connection.release();
        
        const newId = result.insertId;
        const [newItem] = await (await pool.query(`SELECT * FROM \`${category}\` WHERE id = ?`, [newId]));

        return NextResponse.json( (newItem as any)[0], { status: 201 });

    } catch (error) {
        console.error(`API Error (POST /customizations/${category}):`, error);
        return NextResponse.json({ message: 'Failed to create item' }, { status: 500 });
    }
}
