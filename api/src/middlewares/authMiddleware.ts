import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

// Feature usage limits for anonymous users
export const ANONYMOUS_LIMITS: {
    [key: string]: number;
} = {
    conversations: 1,
    images: 1,
    textToSpeech: 1,
    speechToText: 0, // Not allowed for anonymous users
    documentProcessing: 1, // Changed from 0 to 1 to allow anonymous document processing
    conversation: 1,
    chat: 1
};

// Initialize session limits for anonymous users
export const initializeSessionLimits = (req: any, res: Response, next: NextFunction) => {
    if (!req.session.usage) {
        req.session.usage = {
            conversations: 0,
            images: 0,
            textToSpeech: 0,
            speechToText: 0,
            documentProcessing: 0,
            conversation: 0,
            chat: 0
        };
    }
    next();
};

// Check if user is authenticated and set user on request
export const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            // Use userId instead of id to match what's in the token payload
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { userId: string };

            // Find user by ID
            const user = await User.findById(decoded.userId);
            if (user) {
                req.user = user.toObject();
                // Store original user ID as string for easier use with file uploads
                req.userId = user._id.toString();
            }
        }
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        next();
    }
};

// Middleware that requires authentication
export const requireAuth = (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
};

// Middleware that authenticates a user if token exists but continues if not
export const authenticate = (req: any, res: Response, next: NextFunction) => {
    // Get token from Authorization header or query parameter
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : req.query.token;

    if (!token) {
        // Instead of returning 401, just set req.user to null and continue
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        // Instead of returning 401, just set req.user to null and continue
        req.user = null;
        next();
    }
};

// Middleware that allows anonymous access but authenticates if token exists
export const allowAnonymous = (req: any, res: Response, next: NextFunction) => {
    next(); // Proceed regardless of authentication status
};

// Check feature access based on authentication and usage limits
export const checkFeatureAccess = (featureType: string) => {
    return (req: any, res: Response, next: NextFunction) => {
        // Authenticated users have unlimited access
        if (req.user) {
            return next();
        }

        // For anonymous users, check limits
        if (req.session.usage && typeof featureType === 'string') {
            const usageCount = req.session.usage[featureType as keyof typeof req.session.usage] || 0;
            const limit = ANONYMOUS_LIMITS[featureType] || 0;

            if (usageCount >= limit) {
                return res.status(403).json({
                    success: false,
                    message: `You've reached the limit for ${featureType}. Please log in to continue.`
                });
            }

            // Increment usage counter
            if (featureType in req.session.usage) {
                (req.session.usage as any)[featureType] = usageCount + 1;
            }
        }

        next();
    };
};

export const checkAnonymousAccess = async (req: any, res: Response, next: NextFunction) => {
    try {
        // Initialize session usage if it doesn't exist
        if (!req.session.usage) {
            req.session.usage = {
                conversations: 0,
                images: 0,
                textToSpeech: 0,
                speechToText: 0,
                documentProcessing: 0,
                conversation: 0,
                chat: 0
            };
        }
        next();
    } catch (error) {
        next();
    }
};

export const trackApiUsage = (feature: string) => {
    return async (req: any, res: Response, next: NextFunction) => {
        try {
            // Initialize usage if not exists
            if (!req.session.usage) {
                req.session.usage = {
                    conversations: 0,
                    images: 0,
                    textToSpeech: 0,
                    speechToText: 0,
                    documentProcessing: 0,
                    conversation: 0,
                    chat: 0
                };
            }

            // Increment usage for the specific feature
            if (req.session.usage && feature in req.session.usage) {
                (req.session.usage as any)[feature]++;
            }

            await req.session.save();
            next();
        } catch (error) {
            next();
        }
    };
};

export const authenticateJWT = async (req: any, res: Response, next: NextFunction) => {
    try {
        // Get the token from the request headers or cookies
        const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
        
        // Debug
        console.log('Auth middleware token:', token ? 'Present' : 'Missing');
        
        if (!token) {
            // No token - continue as unauthenticated user
            req.user = null;
            return next();
        }
        
        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
            
            // Debug
            console.log('Decoded token:', decoded);
            
            // Find the user with the given ID
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                req.user = null;
                return next();
            }
            
            // Attach the user to the request
            req.user = user;
            
            // Debug - make sure _id is present
            console.log('User attached to request:', req.user._id ? 'ID present' : 'ID missing');
            
            // Also store in session
            if (req.session) {
                req.session.userId = user._id;
                req.session.isAuthenticated = true;
                await req.session.save();
            }
            
            next();
        } catch (err) {
            console.error('JWT verification error:', err);
            req.user = null;
            next();
        }
    } catch (error) {
        console.error('Authentication error:', error);
        req.user = null;
        next();
    }
};
