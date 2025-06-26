import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs'; // Changed from 'bcrypt' to 'bcryptjs'
import jwt from 'jsonwebtoken';

export class AuthController {
    /**
     * Register a new user
     */
    async register (req: any, res: Response) {
        try {
            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const user = new User({
                username,
                email,
                password: hashedPassword
            });

            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '24h' }
            );

            res.status(201).json({
                success: true,
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Server error during registration' });
        }
    }

    /**
     * Login user
     */
    async login (req: any, res: Response) {
        try {
            const { email, username, password } = req.body;

            // Find user by email or username
            let user;
            if (email) {
                user = await User.findOne({ email });
            } else if (username) {
                user = await User.findOne({ username });
            } else {
                return res.status(400).json({ error: 'Email or username is required' });
            }

            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Basic logging for password verification
            console.log('Verifying password for user:', user.email);

            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password comparison result:', isMatch);

            if (!isMatch) {
                console.error('Password comparison failed for:', user.email);
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    }

    /**
     * Get current user information
     */
    async getCurrentUser (req: any, res: Response) {
        try {
            // User is already added to request by authenticate middleware
            res.json({
                success: true,
                user: {
                    _id: req?.user?._id,
                    username: req?.user?.username,
                    email: req?.user?.email
                }
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Server error fetching user data' });
        }
    }

    /**
     * Logout user
     */
    async logout (req: any, res: Response) {
        // Since JWT is stateless, we don't need to do anything server-side
        // Client should remove token from storage
        res.json({ success: true, message: 'Logged out successfully' });
    }
}
