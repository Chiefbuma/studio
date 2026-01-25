import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        const [rows]: any[] = await connection.query('SELECT * FROM admins WHERE email = ?', [email]);
        connection.release();

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const admin = rows[0];

        // IMPORTANT: The seeded password is a placeholder. 
        // For a real app, generate a hash for 'admin' (e.g., using an online bcrypt generator) and replace it in the seed script.
        // For this prototype, we'll compare against the plain text 'admin' if the stored hash is still the placeholder.
        let isValid = false;
        if (admin.password_hash.startsWith('$2b$10$your_bcrypt_hash')) {
            if (password === 'admin') {
                isValid = true;
            }
        } else {
             isValid = await bcrypt.compare(password, admin.password_hash);
        }

        if (!isValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1h' });

        return NextResponse.json({ token });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
