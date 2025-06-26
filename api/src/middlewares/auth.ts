import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

// Interface for JWT payload
interface TokenPayload {
    userId: string;
    [key: string]: any;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req: any, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required', message: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as TokenPayload;

        // Find user by ID
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Add user to request object
        req.user = { ...user.toObject(), _id: user._id.toString() };
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};