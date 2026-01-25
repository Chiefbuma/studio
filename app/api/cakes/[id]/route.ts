import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const connection = await pool.getConnection();
        const [rows]: any[] = await connection.query('SELECT * FROM cakes WHERE id = ?', [id]);
        connection.release();

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Cake not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error(`API Error (GET /cakes/${params.id}):`, error);
        return NextResponse.json({ message: 'Failed to fetch cake' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    try {
        const { id } = params;
        const connection = await pool.getConnection();
        const [result]: any = await connection.query('DELETE FROM cakes WHERE id = ?', [id]);
        connection.release();

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Cake not found' }, { status: 404 });
        }

        return new Response(null, { status: 204 }); // Standard practice for successful DELETE
    } catch (error) {
        console.error(`API Error (DELETE /cakes/${params.id}):`, error);
        return NextResponse.json({ message: 'Failed to delete cake. It may be part of a special offer or an order.' }, { status: 500 });
    }
}
