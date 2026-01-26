
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';
import type { Cake } from '@/lib/types';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows]: any[] = await connection.query('SELECT * FROM cakes');
    connection.release();
    
    const cakes: Cake[] = rows.map((cake: any) => ({
        ...cake,
        base_price: parseFloat(cake.base_price),
        rating: parseFloat(cake.rating),
        orders_count: parseInt(cake.orders_count, 10),
        customizable: Boolean(cake.customizable),
    }));

    return NextResponse.json(cakes);
  } catch (error: any) {
    console.error('API Error (GET /api/cakes):', error);
    let message = 'Failed to fetch cakes due to a server error.';
    if (error.code === 'ER_NO_SUCH_TABLE') {
        message = 'Database setup incomplete: The `cakes` table was not found. Please ensure you have run the SQL scripts in the README.md file.';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        message = 'Database connection error: Could not connect to the database server. Please ensure the Docker environment is running correctly.';
    }
    return NextResponse.json({ message: message }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    
    let body;
    try {
        body = await req.json();
        const { id, name, description, base_price, image_id, rating, category, orders_count, ready_time, defaultFlavorId, customizable } = body;

        // Simple validation
        if (!id || !name || !description || base_price === undefined) {
            return NextResponse.json({ message: 'Missing required fields: id, name, description, base_price' }, { status: 400 });
        }
        
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO cakes (id, name, description, base_price, image_id, rating, category, orders_count, ready_time, defaultFlavorId, customizable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, description, base_price, image_id, rating, category, orders_count, ready_time, defaultFlavorId, customizable]
        );
        
        const [newCakeRows]: any[] = await connection.query('SELECT * FROM cakes WHERE id = ?', [id]);
        connection.release();

        const newCake = newCakeRows[0];
        const formattedCake: Cake = {
            ...newCake,
            base_price: parseFloat(newCake.base_price),
            rating: parseFloat(newCake.rating),
            orders_count: parseInt(newCake.orders_count, 10),
            customizable: Boolean(newCake.customizable),
        };

        return NextResponse.json(formattedCake, { status: 201 });

    } catch (error: any) {
        console.error('API Error (POST /cakes):', error);
         if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: `A cake with ID '${body?.id}' already exists.` }, { status: 409 });
        }
        return NextResponse.json({ message: 'Failed to create cake' }, { status: 500 });
    }
}
