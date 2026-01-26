import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

const allowedCategories = ['flavors', 'sizes', 'colors', 'toppings'];

export async function PUT(req: NextRequest, { params }: { params: { category: string, id: string } }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    
    const { category, id } = params;
    if (!allowedCategories.includes(category)) {
        return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    try {
        const body = await req.json();
        // Prevent changing the ID
        const { id: bodyId, ...updateData } = body;

        const columns = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = columns.map(col => `\`${col}\` = ?`).join(', ');

        if (columns.length === 0) {
            return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        const [result]: any = await connection.query(
            `UPDATE \`${category}\` SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
        
        if (result.affectedRows === 0) {
            connection.release();
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        const [updatedRows]: any[] = await connection.query(`SELECT * FROM \`${category}\` WHERE id = ?`, [id]);
        connection.release();

        const updatedItem = updatedRows[0];
        if (updatedItem.price) {
            updatedItem.price = parseFloat(updatedItem.price);
        }

        return NextResponse.json(updatedItem);

    } catch (error) {
        console.error(`API Error (PUT /customizations/${category}/${id}):`, error);
        return NextResponse.json({ message: 'Failed to update item' }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, { params }: { params: { category: string, id: string } }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    
    const { category, id } = params;
    if (!allowedCategories.includes(category)) {
        return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    try {
        const connection = await pool.getConnection();
        const [result]: any = await connection.query(`DELETE FROM \`${category}\` WHERE id = ?`, [id]);
        connection.release();

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        return new Response(null, { status: 204 });

    } catch (error) {
        console.error(`API Error (DELETE /customizations/${category}/${id}):`, error);
        return NextResponse.json({ message: 'Failed to delete item' }, { status: 500 });
    }
}
