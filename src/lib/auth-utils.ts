import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export function verifyAuth(req: NextRequest): { authenticated: boolean; error?: string } {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false, error: 'Authorization header missing or malformed' };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return { authenticated: false, error: 'Token missing' };
    }

    try {
        jwt.verify(token, JWT_SECRET);
        return { authenticated: true };
    } catch (error) {
        return { authenticated: false, error: 'Invalid or expired token' };
    }
}
