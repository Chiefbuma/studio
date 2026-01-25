import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

const allowedCategories = ['flavors', 'sizes', 'colors', 'toppings'];

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
