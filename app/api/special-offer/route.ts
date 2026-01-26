import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';
import type { Cake, SpecialOffer } from '@/lib/types';

export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [rows]: any[] = await connection.query(`
            SELECT 
                so.discount_percentage,
                c.id, c.name, c.description, c.base_price, c.image_id, c.rating, c.category, c.orders_count, c.ready_time, c.defaultFlavorId, c.customizable
            FROM special_offers so
            JOIN cakes c ON so.cake_id = c.id
            LIMIT 1
        `);
        connection.release();

        if (rows.length === 0) {
            return NextResponse.json({ message: 'No special offer found' }, { status: 404 });
        }

        const offer = rows[0];
        const original_price = parseFloat(offer.base_price);
        const discount_percentage = parseInt(offer.discount_percentage, 10);
        const special_price = original_price * (1 - discount_percentage / 100);
        const savings = original_price - special_price;

        const responseData: SpecialOffer = {
            cake: {
                id: offer.id,
                name: offer.name,
                description: offer.description,
                base_price: original_price,
                image_id: offer.image_id,
                rating: parseFloat(offer.rating),
                category: offer.category,
                orders_count: parseInt(offer.orders_count, 10),
                ready_time: offer.ready_time,
                defaultFlavorId: offer.defaultFlavorId,
                customizable: Boolean(offer.customizable)
            },
            discount_percentage: discount_percentage,
            original_price: original_price,
            special_price,
            savings,
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('API Error (GET /special-offer):', error);
        return NextResponse.json({ message: 'Failed to fetch special offer' }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    
    const connection = await pool.getConnection();
    try {
        const { cake_id, discount_percentage } = await req.json();

        if (!cake_id || discount_percentage === undefined) {
            return NextResponse.json({ message: 'Cake ID and discount percentage are required' }, { status: 400 });
        }
        
        await connection.beginTransaction();
        await connection.query('TRUNCATE TABLE special_offers');
        await connection.query(
            'INSERT INTO special_offers (cake_id, discount_percentage) VALUES (?, ?)',
            [cake_id, discount_percentage]
        );
        await connection.commit();
        
        // Fetch the newly updated offer to return it, then release connection
        const newOfferResponse = await GET();
        connection.release();
        return newOfferResponse;

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('API Error (PUT /special-offer):', error);
        return NextResponse.json({ message: 'Failed to update special offer' }, { status: 500 });
    }
}
