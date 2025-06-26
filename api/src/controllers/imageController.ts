import { Request, Response } from 'express';
import Image from '../models/image';
import { generateImage as generateAIImage } from '../services/imageService';
import { checkUserLimit, incrementUserUsage } from '../services/usageService';
import path from 'path';
import fs from 'fs';

// Generate an image using AI
export const generateImage = async (req: any, res: Response) => {
    try {
        const { prompt, size } = req.body;
        const userId = req.user?.id || req.sessionID; // Use session ID for anonymous users

        // Check usage limits for non-authenticated users
        if (!req.user) {
            const { hasReachedLimit, remaining } = await checkUserLimit(userId, 'imageGeneration');

            if (hasReachedLimit) {
                return res.status(403).json({
                    success: false,
                    error: 'Usage limit reached',
                    message: 'You have reached your daily limit for image generation. Please try again tomorrow or log in.'
                });
            }
        }

        // Generate the image using the service
        const result = await generateAIImage(prompt, size);

        // Increment usage for non-authenticated users
        if (!req.user) {
            await incrementUserUsage(userId, 'imageGeneration');
        }

        // Save to database if user is authenticated
        if (req.user) {
            const newImage = new Image({
                userId: req.user._id,
                prompt,
                imageUrl: result.imageUrl,
                fileName: path.basename(result.localPath),
                generatedAt: new Date(),
                isGenerated: true
            });
            await newImage.save();
        }

        res.status(200).json({
            success: true,
            imageUrl: result.imageUrl,
            base64Data: result.base64Data
        });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ success: false, message: 'Error generating image' });
    }
};

// Upload an image
export const uploadImage = async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Save to database if user is authenticated
        if (req.user) {
            const newImage = new Image({
                userId: req.user._id,
                imageUrl: `/uploads/images/${req.file.filename}`,
                fileName: req.file.filename,
                generatedAt: new Date(),
                isGenerated: false
            });
            await newImage.save();
        }

        res.status(200).json({
            success: true,
            data: { url: `/uploads/images/${req.file.filename}` }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, message: 'Error uploading image' });
    }
};

// Get image history for a user
export const getImageHistory = async (req: any, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const images = await Image.find({ userId: req.user._id }).sort({ generatedAt: -1 });
        res.status(200).json({ success: true, data: images });
    } catch (error) {
        console.error('Error fetching image history:', error);
        res.status(500).json({ success: false, message: 'Error fetching image history' });
    }
};

// Get a specific image
export const getImage = async (req: any, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const image = await Image.findOne({ _id: req.params.id, userId: req.user._id });

        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }

        res.status(200).json({ success: true, data: image });
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ success: false, message: 'Error fetching image' });
    }
};

/**
 * Delete an image created by the user
 */
export const deleteImage = async (req: any, res: Response) => {
    try {
        // Only logged in users can delete their images
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to delete images'
            });
        }

        const imageId = req.params.id;

        // Find the image record
        const image = await Image.findOne({
            _id: imageId,
            userId: req.user._id
        });

        if (!image) {
            return res.status(404).json({ error: 'Image not found or not authorized' });
        }

        // Delete the physical file if it exists
        if (image.imageUrl) {
            const filePath = path.join(__dirname, '../..', image.imageUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete the database record
        await Image.deleteOne({ _id: imageId });

        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
};