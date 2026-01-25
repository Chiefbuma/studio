import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

const allowedStatuses = ['processing', 'complete', 'cancelled'];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
        const { id } = params;
        const { status } = await req.json();

        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const [result]: any = await connection.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
        
        if (result.affectedRows === 0) {
            connection.release();
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
        
        const [updatedOrderRows]: any = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
        connection.release();
        
        return NextResponse.json(updatedOrderRows[0]);
    } catch (error) {
        connection.release();
        console.error(`API Error (PUT /orders/${params.id}/status):`, error);
        return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
    }
}
