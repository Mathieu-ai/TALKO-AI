import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/user';

// In production, this should be set through environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
    id: string;
    username: string;
    email: string;
}

export const generateToken = (user: UserDocument): string => {
    const payload: JwtPayload = {
        id: user._id.toString(),
        username: user.username,
        email: user.email
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        return null;
    }
};
