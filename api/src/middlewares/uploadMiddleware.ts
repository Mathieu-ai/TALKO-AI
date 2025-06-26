import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Create upload directories if they don't exist
const createDirectories = () => {
    const dirs = ['./uploads', './uploads/audio', './uploads/documents', './uploads/images', './uploads/profiles'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createDirectories();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = './uploads';

        // Determine the appropriate subdirectory based on file type
        const fileType = file.mimetype.split('/')[0];
        if (fileType === 'audio') {
            uploadPath = './uploads/audio';
        } else if (fileType === 'image') {
            // Check if this is specifically a profile picture upload
            if (req.path === '/users/profile-picture' || req.query.type === 'profile') {
                uploadPath = './uploads/profiles';
            } else {
                uploadPath = './uploads/images';
            }
        } else {
            uploadPath = './uploads/documents';
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create a unique filename with UUID to prevent collisions
        const uniqueId = uuidv4();
        const fileExt = path.extname(file.originalname);
        const sanitizedName = file.originalname
            .replace(/\s+/g, '-')
            .replace(fileExt, '')
            .replace(/[^a-zA-Z0-9-_]/g, '');
            
        cb(null, `${Date.now()}-${uniqueId}-${sanitizedName}${fileExt}`);
    }
});

// Set up multer with configured storage
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    }
});
