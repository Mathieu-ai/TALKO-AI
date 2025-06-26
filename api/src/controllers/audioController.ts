import { Request, Response } from 'express';
import * as audioService from '../services/audioService';
import * as usageService from '../services/usageService';  // Add this import
import { FeatureType } from '../types/featureTypes';
import { checkAnonymousAccess, trackFeatureUsage } from '../middlewares/featureAccessMiddleware';
import UserAudio from '../models/userAudio';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import mongoose from 'mongoose';

export default class AudioController {
    /**
     * Generate speech from text
     */
    static async textToSpeech (req: any, res: Response) {
        try {
            // Debug the authentication state
            console.log('Authentication status:', req.session.isAuthenticated, 'User ID:', req.session.userId, 'User object:', req.user);
            
            // Replace with usageService check for TEXT_TO_SPEECH feature
            if (!req.session.isAuthenticated) {
                const sessionId = req.anonymousSessionId || req.session.anonymousId || req.ip;
                const { hasReachedLimit, remaining } = await usageService.checkUserLimit(sessionId, FeatureType.TEXT_TO_SPEECH);
                
                if (hasReachedLimit) {
                    const retryAfter = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                    return res.status(429).json({
                        error: 'Free usage limit reached',
                        message: 'Please log in to continue using the audio feature',
                        retryAfter
                    });
                }
            }

            const { text, voice } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const audioUrl = await audioService.generateSpeech(text, voice);
            const filename = path.basename(audioUrl);

            // Save reference to the audio in database for logged-in users
            if (req.user && req.user.userId) {
                try {
                    await UserAudio.create({
                        userId: req.user.userId ,
                        type: 'text_to_speech',
                        text: text,
                        audioUrl: audioUrl,
                        createdAt: new Date()
                    });
                } catch (dbError) {
                    console.error('Error saving audio to user history:', dbError);
                    console.error('User object:', req.user);
                    // Continue execution even if saving to history fails
                }
            } else if (req.session && req.session.userId) {
                // Try using userId from session if it exists
                try {
                    await UserAudio.create({
                        userId: req.session.userId,
                        type: 'text_to_speech',
                        text: text,
                        audioUrl: audioUrl,
                        createdAt: new Date()
                    });
                } catch (dbError) {
                    console.error('Error saving audio using session userId:', dbError);
                    // Continue execution even if saving to history fails
                }
            } else {
                console.log('No user or userId available to store audio history');
            }

            // Track usage
            if (req.user) {
                await trackFeatureUsage(FeatureType.TEXT_TO_SPEECH)(req, res, () => { });
            } else if (req.anonymousSessionId) {
                await trackFeatureUsage(FeatureType.TEXT_TO_SPEECH)(req, res, () => { });
            }

            // Create stream URL that doesn't require authentication
            const streamUrl = `/api/audio/stream/${filename}`;
            
            // Properly formatted download URL for logged-in users
            const downloadUrl = req.user ? `/api/audio/download/${filename}` : null;

            res.json({
                success: true,
                audioUrl: streamUrl, // Use the streamUrl as the main audioUrl
                streamUrl,
                downloadUrl,
                canDownload: !!req.user, // Only logged in users can download
                message: req.user ? null : 'Log in to download and save your generated audio'
            });
        } catch (error) {
            console.error('Error in text to speech:', error);
            res.status(500).json({ error: 'Failed to generate speech' });
        }
    }

    /**
     * Transcribe audio to text (only for logged-in users)
     */
    static async speechToText (req: any, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    error: 'Audio file is required',
                    success: false,
                    message: 'Please upload an audio file'
                });
            }

            // Log file information for debugging
            console.log('Processing audio file:', {
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                originalname: req.file.originalname
            });

            // Ensure the file has a proper extension based on mimetype
            let filePath = req.file.path;
            const originalExtension = path.extname(req.file.originalname).toLowerCase();
            
            if (!originalExtension) {
                // Add extension based on mimetype if original doesn't have one
                const mimeToExt: {[key: string]: string} = {
                    'audio/mpeg': '.mp3',
                    'audio/mp3': '.mp3',
                    'audio/wav': '.wav',
                    'audio/ogg': '.ogg',
                    'audio/webm': '.webm'
                };
                
                const newExt = mimeToExt[req.file.mimetype] || '.wav';
                const newPath = filePath + newExt;
                fs.renameSync(filePath, newPath);
                filePath = newPath;
                console.log('Added extension to file:', newPath);
            }

            // Verify the file exists and is readable
            if (!fs.existsSync(filePath)) {
                return res.status(400).json({
                    error: 'File not found or not readable',
                    success: false,
                    message: 'The uploaded file could not be processed'
                });
            }

            const transcription = await audioService.transcribeAudio(filePath);

            // Save reference for the user
            if (req.user) {
                await UserAudio.create({
                    userId: req.user.userId,
                    type: 'speech_to_text',
                    audioUrl: `/uploads/${path.basename(filePath)}`,
                    text: transcription,
                    createdAt: new Date()
                });

                await trackFeatureUsage(FeatureType.SPEECH_TO_TEXT)(req, res, () => { });
            }

            res.json({
                success: true,
                text: transcription,
                transcription,
                confidence: 1.0
            });
        } catch (error: any) {
            console.error('Error in speech to text:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to transcribe audio', 
                message: error.message || 'Unknown error occurred',
                details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            });
        }
    }

    /**
     * Get user's audio history
     */
    static async getAudioHistory (req: any, res: Response) {
        try {
            // Only logged in users can access history
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please log in to view your audio history'
                });
            }

            const audioHistory = await UserAudio.find({ userId: req.user.userId })
                .sort({ createdAt: -1 })
                .lean();

            res.json({ success: true, audioHistory });
        } catch (error) {
            console.error('Error getting audio history:', error);
            res.status(500).json({ error: 'Failed to retrieve audio history' });
        }
    }

    /**
     * Download audio file (only for logged-in users)
     */
    static async getAudio (req: any, res: Response) {
        try {
            // Check if user is logged in
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please log in to download audio files'
                });
            }

            const filename = req.params.filename;
            const filePath = path.join(__dirname, '../../uploads/audio', filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'File not found' });
            }

            // Set appropriate headers for file download
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.setHeader('Content-Type', 'audio/mpeg');

            // Stream the file directly
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error('Error downloading audio:', error);
            res.status(500).json({ error: 'Failed to download audio' });
        }
    }

    /**
     * Stream audio file (no authentication required)
     * This improved implementation supports HTTP Range requests for proper seeking
     * and caching for better performance
     */
    static async streamAudio(req: Request, res: Response) {
        try {
            const fileIdOrName = req.params.filename;
            let filePath = null;
            
            console.log(`Streaming request for: ${fileIdOrName}`);
            
            // First, check if this is a direct filename
            filePath = path.join(__dirname, '../../uploads/audio', fileIdOrName);
            if (fs.existsSync(filePath)) {
                console.log(`Found file directly at: ${filePath}`);
                return streamAudioFile(req, res, filePath);
            }
            
            // As a fallback, try to look up by ID (keeping for backward compatibility)
            // Note: This lookup should work even without authentication
            if (mongoose.Types.ObjectId.isValid(fileIdOrName)) {
                const audioRecord = await UserAudio.findById(fileIdOrName);
                
                if (audioRecord && audioRecord.audioUrl) {
                    // Extract the actual filename from the audioUrl
                    const filename = path.basename(audioRecord.audioUrl);
                    filePath = path.join(__dirname, '../../uploads/audio', filename);
                    
                    // Verify file exists
                    if (fs.existsSync(filePath)) {
                        console.log(`Found file by DB lookup at: ${filePath}`);
                        return streamAudioFile(req, res, filePath);
                    }
                    
                    // Try the full path from audioUrl if relative
                    if (audioRecord.audioUrl.startsWith('/')) {
                        const fullPath = path.join(__dirname, '../..', audioRecord.audioUrl);
                        if (fs.existsSync(fullPath)) {
                            console.log(`Found file by full path at: ${fullPath}`);
                            return streamAudioFile(req, res, fullPath);
                        }
                    }
                }
            }
            
            // If we get here, neither approach found a file
            console.warn(`Audio file not found: ${fileIdOrName}`);
            return res.status(404).json({ 
                error: 'File not found',
                message: `File ${fileIdOrName} could not be located`
            });
        } catch (error) {
            console.error('Error streaming audio:', error);
            res.status(500).json({ error: 'Failed to stream audio' });
        }
    }

    /**
     * Transcribe audio to text (separate from speechToText, for document processing)
     */
    static async transcribeAudio (req: any, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Audio file is required' });
            }

            const filePath = req.file.path;
            const transcription = await audioService.transcribeAudio(filePath);

            // Save reference for the user if logged in
            if (req.user) {
                await UserAudio.create({
                    userId: req.user.userId,
                    type: 'speech_to_text',
                    audioUrl: `/uploads/${req.file.filename}`,
                    text: transcription,
                    createdAt: new Date()
                });

                await trackFeatureUsage(FeatureType.SPEECH_TO_TEXT)(req, res, () => { });
            }

            res.json({
                success: true,
                transcription
            });
        } catch (error) {
            console.error('Error in audio transcription:', error);
            res.status(500).json({ error: 'Failed to transcribe audio' });
        }
    }

    /**
     * Delete user's audio file
     */
    static async deleteAudio (req: any, res: Response) {
        try {
            // Only logged in users can delete their audio
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please log in to delete audio files'
                });
            }

            const audioId = req.params.id;

            // Find the audio record
            const audio = await UserAudio.findOne({
                _id: audioId,
                userId: req.user.userId
            });

            if (!audio) {
                return res.status(404).json({ error: 'Audio not found or not authorized' });
            }

            // Delete the physical file if it exists
            if (audio.audioUrl) {
                const filePath = path.join(__dirname, '../..', audio.audioUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            // Delete the database record
            await UserAudio.deleteOne({ _id: audioId });

            res.json({ success: true, message: 'Audio deleted successfully' });
        } catch (error) {
            console.error('Error deleting audio:', error);
            res.status(500).json({ error: 'Failed to delete audio' });
        }
    }

    /**
     * Download multiple audio files as a zip (only for logged-in users)
     * Also handles single file downloads as a zip
     */
    static async downloadMultipleAsZip(req: any, res: Response) {
        try {
            // Check if user is logged in
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please log in to download audio files'
                });
            }

            const { audioIds } = req.body;
            
            if (!audioIds || !Array.isArray(audioIds) || audioIds.length === 0) {
                return res.status(400).json({ error: 'No audio IDs provided' });
            }

            // Fetch audio records for the user
            const audioRecords = await UserAudio.find({
                _id: { $in: audioIds },
                userId: req.user.userId
            }).lean();

            if (audioRecords.length === 0) {
                return res.status(404).json({ error: 'No audio files found' });
            }

            // Set response headers for zip download
            // Use a different filename if it's a single file
            const zipFilename = audioIds.length === 1 
                ? `audio-file-${Date.now()}.zip` 
                : `audio-files-${Date.now()}.zip`;
                
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=${zipFilename}`);

            // Create zip archive with maximum compression
            const archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level to maximum (0-9)
            });

            // Pipe the archive to the response
            archive.pipe(res);

            // Track processed files for debugging
            const processedFiles = [];
            const failedFiles = [];

            // Add each audio file to the archive
            for (const record of audioRecords) {
                if (!record.audioUrl) {
                    console.warn('Audio URL is undefined for record:', record);
                    failedFiles.push({ id: record._id, reason: 'No audioUrl' });
                    continue;
                }

                console.log('Processing audio record:', {
                    id: record._id,
                    type: record.type,
                    audioUrl: record.audioUrl
                });

                // Try multiple approaches to find the file
                let audioPath = null;
                let foundFile = false;
                
                // Extract filename from the URL/path string
                let filename = '';
                
                // 1. Direct extraction of filename from audioUrl
                if (record.audioUrl) {
                    filename = path.basename(record.audioUrl);
                }
                
                // Locations to check, in order of priority
                const possibleLocations = [
                    // 1. Direct path from record.audioUrl (if it's an absolute path)
                    record.audioUrl.startsWith('/') ? path.join(__dirname, '../..', record.audioUrl) : null,
                    // 2. Path if audioUrl is relative to uploads folder
                    path.join(__dirname, '../../uploads', record.audioUrl.replace(/^\/uploads\//, '')),
                    // 3. Direct path in uploads/audio with the extracted filename
                    path.join(__dirname, '../../uploads/audio', filename),
                    // 4. If filename contains 'stream' or similar, try without that part
                    filename.includes('stream') ? path.join(__dirname, '../../uploads/audio', filename.replace('stream-', '')) : null
                ].filter(Boolean); // Remove null entries
                
                console.log('Checking possible file locations:', possibleLocations);
                
                // Try each possible location
                for (const location of possibleLocations) {
                    if (location && fs.existsSync(location)) {
                        audioPath = location;
                        foundFile = true;
                        console.log('Found audio file at:', audioPath);
                        break;
                    }
                }
                
                // If still not found, try a more comprehensive search in the uploads/audio directory
                if (!foundFile) {
                    console.log('File not found in expected locations, searching uploads/audio directory');
                    const uploadsDir = path.join(__dirname, '../../uploads/audio');
                    
                    if (fs.existsSync(uploadsDir)) {
                        // Read all files in the uploads/audio directory
                        const files = fs.readdirSync(uploadsDir);
                        
                        // Extract a unique identifier from the audioUrl to use for matching
                        const urlParts = record.audioUrl.split('/');
                        const fileIdentifiers = urlParts.filter(part => 
                            part.length > 5 && !['uploads', 'audio', 'stream', 'api'].includes(part)
                        );
                        
                        console.log('Looking for file identifiers:', fileIdentifiers);
                        
                        // Try to find a file that contains any of our identifiers
                        for (const file of files) {
                            for (const identifier of fileIdentifiers) {
                                if (file.includes(identifier)) {
                                    audioPath = path.join(uploadsDir, file);
                                    foundFile = true;
                                    console.log('Found matching audio file:', file);
                                    break;
                                }
                            }
                            if (foundFile) break;
                        }
                    }
                }

                if (foundFile && audioPath) {
                    // Use the text as the filename if available, otherwise use the file's basename
                    let archiveFilename;
                    if (record.text) {
                        // Clean up text for use as filename
                        archiveFilename = record.text
                            .substring(0, 30)
                            .replace(/[^a-z0-9]/gi, '_')
                            .replace(/_+/g, '_')
                            .toLowerCase();
                            
                        // Add appropriate extension based on record type
                        archiveFilename += record.type === 'text_to_speech' ? '.mp3' : '.txt';
                    } else {
                        archiveFilename = path.basename(audioPath);
                    }
                    
                    // Add file to archive
                    archive.file(audioPath, { name: archiveFilename });
                    processedFiles.push({ id: record._id, path: audioPath, filename: archiveFilename });

                    // If it's a speech-to-text record, also add a text file with the transcription
                    if (record.type === 'speech_to_text' && record.text) {
                        const textFilename = `${path.basename(archiveFilename, path.extname(archiveFilename))}.txt`;
                        archive.append(record.text, { name: textFilename });
                        processedFiles.push({ id: record._id, type: 'text', filename: textFilename });
                    }
                } else {
                    console.warn('Audio file not found for record:', record._id, 'audioUrl:', record.audioUrl);
                    failedFiles.push({ id: record._id, audioUrl: record.audioUrl, reason: 'File not found' });
                }
            }

            // Log results for debugging
            console.log(`ZIP archive creation: ${processedFiles.length} files processed, ${failedFiles.length} failed`);
            if (failedFiles.length > 0) {
                console.warn('Failed files:', failedFiles);
            }

            // Finalize the archive
            await archive.finalize();
            
        } catch (error) {
            console.error('Error creating zip file:', error);
            res.status(500).json({ error: 'Failed to create zip file' });
        }
    }

    /**
     * Export transcription in different formats
     */
    static async exportTranscription(req: any, res: Response) {
        try {
            // Check if user is logged in
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please log in to export transcriptions'
                });
            }

            const audioId = req.params.id;
            const format = req.query.format || 'txt';

            // Find the audio record
            const audio = await UserAudio.findOne({
                _id: audioId,
                userId: req.user.userId,
                type: 'speech_to_text' // Only speech-to-text items can be exported
            });

            if (!audio) {
                return res.status(404).json({ error: 'Transcription not found or not authorized' });
            }

            if (!audio.text) {
                return res.status(400).json({ error: 'No transcription text available for this item' });
            }

            // Process the transcription based on the requested format
            let output: Buffer | string = '';
            let contentType = 'text/plain';
            let filename = `transcription-${Date.now()}`;

            switch (format) {
                case 'txt':
                    output = audio.text;
                    contentType = 'text/plain';
                    filename += '.txt';
                    break;
                    
                case 'json':
                    const jsonData = {
                        id: audio._id,
                        text: audio.text,
                        createdAt: audio.createdAt,
                        metadata: {
                            duration: audio.duration || '',
                            userId: audio.userId,
                            type: audio.type
                        }
                    };
                    output = JSON.stringify(jsonData, null, 2);
                    contentType = 'application/json';
                    filename += '.json';
                    break;
                    
                case 'csv':
                    output = `"id","text","created_at"\n"${audio._id}","${audio.text.replace(/"/g, '""')}","${audio.createdAt}"`;
                    contentType = 'text/csv';
                    filename += '.csv';
                    break;
                    
                case 'md':
                    output = `# Transcription\n\n${audio.text}\n\n---\n\nGenerated: ${audio.createdAt}`;
                    contentType = 'text/markdown';
                    filename += '.md';
                    break;
                    
                case 'srt':
                    // Simple SRT format (without actual timestamps)
                    output = `1\n00:00:00,000 --> 00:00:10,000\n${audio.text}`;
                    contentType = 'text/plain';
                    filename += '.srt';
                    break;
                
                // For docx and pdf, we would need additional libraries to generate these formats
                // Here's a placeholder that indicates these formats require server-side processing
                case 'docx':
                case 'pdf':
                    return res.status(501).json({ 
                        error: `${format.toUpperCase()} export not yet implemented`, 
                        message: 'This format will be available soon' 
                    });

                default:
                    return res.status(400).json({ error: 'Unsupported export format' });
            }

            // Set appropriate headers for file download
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            // Send the response
            res.send(output);
            
        } catch (error) {
            console.error('Error exporting transcription:', error);
            res.status(500).json({ error: 'Failed to export transcription' });
        }
    }

    /**
     * Export multiple transcriptions as a zip file
     */
    static async exportMultipleTranscriptions(req: any, res: Response) {
        try {
            // Check if user is logged in
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please log in to export transcriptions'
                });
            }

            const { audioIds, format = 'txt' } = req.body;
            
            if (!audioIds || !Array.isArray(audioIds) || audioIds.length === 0) {
                return res.status(400).json({ error: 'No audio IDs provided' });
            }

            // Fetch audio records for the user
            const audioRecords = await UserAudio.find({
                _id: { $in: audioIds },
                userId: req.user.userId,
                type: 'speech_to_text' // Only speech-to-text items can be exported
            }).lean();

            if (audioRecords.length === 0) {
                return res.status(404).json({ error: 'No transcriptions found' });
            }

            // Set response headers for zip download
            const zipFilename = `transcriptions-${format}-${Date.now()}.zip`;
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

            // Create zip archive
            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression
            });

            // Pipe the archive to the response
            archive.pipe(res);

            // Track processed files for debugging
            const processedFiles = [];
            const failedFiles = [];

            // Process each transcription and add to the archive
            for (const record of audioRecords) {
                if (!record.text) {
                    console.warn('No text available for record:', record._id);
                    failedFiles.push({ id: record._id, reason: 'No text content' });
                    continue;
                }

                let content = '';
                let fileExt = '';

                // Generate content based on format
                switch (format) {
                    case 'txt':
                        content = record.text;
                        fileExt = '.txt';
                        break;
                        
                    case 'json':
                        content = JSON.stringify({
                            id: record._id,
                            text: record.text,
                            createdAt: record.createdAt,
                            metadata: {
                                duration: record.duration || '',
                                userId: record.userId,
                                type: record.type
                            }
                        }, null, 2);
                        fileExt = '.json';
                        break;
                        
                    case 'csv':
                        content = `"id","text","created_at"\n"${record._id}","${record.text.replace(/"/g, '""')}","${record.createdAt}"`;
                        fileExt = '.csv';
                        break;
                        
                    case 'md':
                        content = `# Transcription\n\n${record.text}\n\n---\n\nGenerated: ${record.createdAt}`;
                        fileExt = '.md';
                        break;
                        
                    case 'srt':
                        content = `1\n00:00:00,000 --> 00:00:10,000\n${record.text}`;
                        fileExt = '.srt';
                        break;
                    
                    // Other formats would need server-side libraries
                    default:
                        content = record.text;
                        fileExt = '.txt';
                }

                // Generate a clean filename based on the first few words of the text
                const filenameBase = record.text.slice(0, 30)
                    .replace(/[^a-z0-9]/gi, '_')
                    .replace(/_+/g, '_')
                    .toLowerCase();
                
                const filename = `${filenameBase}${fileExt}`;
                
                // Add the file to the archive - add a non-empty string
                if (content) {
                    archive.append(content, { name: filename });
                    processedFiles.push({ id: record._id, filename });
                } else {
                    failedFiles.push({ id: record._id, reason: 'Empty content' });
                }
            }

            // Log results for debugging
            console.log(`Transcription ZIP creation: ${processedFiles.length} files processed, ${failedFiles.length} failed`);

            // Finalize the archive
            await archive.finalize();
            
        } catch (error) {
            console.error('Error exporting multiple transcriptions:', error);
            res.status(500).json({ error: 'Failed to export transcriptions' });
        }
    }
}

/**
 * Helper function to determine content type from file extension
 */
function getContentTypeFromFile(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.webm': 'audio/webm'
    };
    return contentTypes[ext] || 'audio/mpeg'; // Default to audio/mpeg if not found
}

/**
 * Helper function to stream audio file with support for HTTP Range requests
 */
function streamAudioFile(req: Request, res: Response, filePath: string) {
    const stat = fs.statSync(filePath);
    const total = stat.size;
    const contentType = getContentTypeFromFile(filePath);

    // Set cache headers to allow caching for 1 hour
    // This is important for efficient replay
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Always set the content type
    res.setHeader('Content-Type', contentType);

    if (req.headers.range) {
        const range = req.headers.range;
        const parts = range.replace(/bytes=/, '').split('-');
        const partialStart = parseInt(parts[0], 10);
        const partialEnd = parts[1] ? parseInt(parts[1], 10) : total - 1;

        const start = partialStart;
        const end = Math.min(partialEnd, total - 1); // Ensure end doesn't exceed file size

        if (start >= total) {
            res.status(416).send('Requested range not satisfiable\n');
            return;
        }

        const chunkSize = (end - start) + 1;
        console.log(`Streaming range: ${start}-${end}/${total} (${chunkSize} bytes)`);
        
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Content-Length': chunkSize,
        });
        
        const file = fs.createReadStream(filePath, { start, end });
        file.pipe(res);
    } else {
        console.log(`Streaming full file: ${total} bytes`);
        res.writeHead(200, {
            'Content-Length': total,
        });
        fs.createReadStream(filePath).pipe(res);
    }
}