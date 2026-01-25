import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM cakes');
    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('API Error:', error);
    // In a production app, you'd want to log this error to a service
    return NextResponse.json({ message: 'Failed to fetch cakes' }, { status: 500 });
  }
}
