import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const createDirectories = () => {
    const dir = './uploads/documents';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

createDirectories();

// Configure storage for documents
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/documents');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

// Set up multer with configured storage
export const documentUpload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common document formats
        const filetypes = /pdf|doc|docx|txt|rtf|odt|csv/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("File upload only supports the following filetypes - " + filetypes));
    }
}).single('document'); // Specify 'document' as the field name

// Error handling middleware for document uploads
export const handleDocumentUploadErrors = (req: any, res: any, next: any) => {
    if (!req.file) {
        console.error('No file provided in the request');
        return res.status(400).json({ 
            success: false, 
            message: 'No file uploaded. Make sure to include a file with field name "document".' 
        });
    }
    
    // All good, proceed
    next();
};
