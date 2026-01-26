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
  } catch (error) {
    console.error('API Error:', error);
    // In a production app, you'd want to log this error to a service
    return NextResponse.json({ message: 'Failed to fetch cakes' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    
    try {
        const body = await req.json();
        const { id, name, description, base_price, image_id, rating, category, orders_count, ready_time, defaultFlavorId, customizable } = body;

        // Simple validation
        if (!id || !name || !description || !base_price) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO cakes (id, name, description, base_price, image_id, rating, category, orders_count, ready_time, defaultFlavorId, customizable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, description, base_price, image_id, rating, category, orders_count, ready_time, defaultFlavorId, customizable]
        );
        connection.release();

        return NextResponse.json({ message: 'Cake created successfully', cake: body }, { status: 201 });

    } catch (error) {
        console.error('API Error (POST /cakes):', error);
        return NextResponse.json({ message: 'Failed to create cake' }, { status: 500 });
    }
}
