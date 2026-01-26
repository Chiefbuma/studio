
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function verifyAuth(req: NextRequest): { authenticated: boolean; error?: string } {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        console.error("CRITICAL: JWT_SECRET environment variable not defined. Authentication will fail.");
        return { authenticated: false, error: 'Server authentication is not configured.' };
    }

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
