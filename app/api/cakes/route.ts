
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
        image_data_uri: cake.image_data_uri,
    }));

    return NextResponse.json(cakes);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error (GET /api/cakes):', error);
    return NextResponse.json({ message: `Failed to fetch cakes: ${message}` }, { status: 500 });
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
        const { id, name, description, base_price, image_data_uri, rating, category, orders_count, ready_time, defaultFlavorId, customizable } = body;

        // Simple validation
        if (!id || !name || !description || base_price === undefined) {
            return NextResponse.json({ message: 'Missing required fields: id, name, description, base_price' }, { status: 400 });
        }
        
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO cakes (id, name, description, base_price, image_data_uri, rating, category, orders_count, ready_time, defaultFlavorId, customizable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, description, base_price, image_data_uri, rating, category, orders_count, ready_time, defaultFlavorId, customizable]
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
            image_data_uri: newCake.image_data_uri,
        };

        return NextResponse.json(formattedCake, { status: 201 });

    } catch (error: any) {
        console.error('API Error (POST /cakes):', error);
         if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: `A cake with ID '${body?.id}' already exists.` }, { status: 409 });
        }
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: `Failed to create cake: ${message}` }, { status: 500 });
    }
}
