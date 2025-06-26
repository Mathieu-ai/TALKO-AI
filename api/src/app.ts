import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import connectToDatabase from './config/database';
import chatRoutes from './routes/chatRoutes';
import audioRoutes from './routes/audioRoutes';
import { Request, Response, NextFunction } from 'express';
import imageRoutes from './routes/imageRoutes';
import documentRoutes from './routes/documentRoutes';
import { authRoutes } from './routes/authRoutes';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated, initializeSessionLimits } from './middlewares/authMiddleware';
import featureRoutes from './routes/featureRoutes';
import deepLearningRoutes from './routes/deepLearningRoutes';
import nlpRoutes from './routes/nlpRoutes';

// Create Express app instance
const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Specify your frontend URL exactly
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'authorization'],
    credentials: true // Important for cookies/authentication
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add session middleware before routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'talko-ai-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    genid: () => uuidv4()
}));

// Add auth middleware after session setup
app.use(initializeSessionLimits);
app.use(isAuthenticated);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create audio uploads directory if it doesn't exist
const audioUploadsDir = path.join(__dirname, '../uploads/audio');
if (!fs.existsSync(audioUploadsDir)) {
    fs.mkdirSync(audioUploadsDir, { recursive: true });
}

// Serve static files from the uploads directory with caching disabled for audio files
app.use('/api/uploads', (req, res, next) => {
    // Disable cache for audio files to prevent stale audio playback
    if (req.path.startsWith('/audio/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
}, express.static(path.join(__dirname, '../uploads')));

// Routes
authRoutes(app);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/deep-learning', deepLearningRoutes);
app.use('/api/nlp', nlpRoutes);

// Error handling middleware
interface ErrorWithStatus extends Error {
    status?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

// Use environment variable for port or default to 3001
const PORT = process.env.PORT || 3001;

// Update the startServer function
const startServer = async () => {
    try {
        connectToDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

// Just export the app without starting it
export default app;