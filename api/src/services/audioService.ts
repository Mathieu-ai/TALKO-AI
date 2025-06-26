import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { createReadStream } from 'fs';

// Load environment variables
dotenv.config();

// Get API key from environment with fallback
const apiKey = process.env.OPENAI_API_KEY || '';

// Check if API key exists
if (!apiKey) {
    console.error("WARNING: OPENAI_API_KEY is not set. OpenAI features will not work.");
}

// Initialize OpenAI with better error handling
const openai = new OpenAI({
    apiKey: apiKey
});

// Helper function to save audio file
async function saveAudioFile (audioBuffer: Buffer): Promise<{ filePath: string, audioUrl: string }> {
    try {
        // Create directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/audio');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileName = `audio_${Date.now()}.mp3`;
        const filePath = path.join(uploadDir, fileName);

        // Save audio file
        fs.writeFileSync(filePath, audioBuffer);

        // Return relative path for URL construction
        // This path should match the static file serving path
        const relativeFilePath = `/uploads/audio/${fileName}`;

        return {
            filePath: filePath,
            audioUrl: relativeFilePath
        };
    } catch (error) {
        console.error('Error saving audio file:', error);
        throw new Error('Failed to save audio file');
    }
}

export async function generateSpeech (text: string, voice: string = 'alloy', model: string = 'tts-1'): Promise<string> {
    try {
        if (!text) {
            throw new Error('Text is required for speech generation');
        }

        const response = await openai.audio.speech.create({
            model: model,
            voice: voice,
            input: text,
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        const { audioUrl } = await saveAudioFile(buffer);

        // Return the correct path without /api prefix - the controller will handle this
        return audioUrl;
    } catch (error: any) {
        console.error('Error generating speech:', error);
        throw error;
    }
}

export async function transcribeAudio (filePath: string): Promise<string> {
    try {
        // Validate file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('Audio file not found');
        }

        // Check file extension to ensure it's supported
        let fileExtension = path.extname(filePath).toLowerCase();
        const supportedFormats = ['.flac', '.m4a', '.mp3', '.mp4', '.mpeg', '.mpga', '.oga', '.ogg', '.wav', '.webm'];
        
        // If no extension or unsupported extension, try to determine from mime type or set default
        if (!fileExtension || !supportedFormats.includes(fileExtension)) {
            console.log('File has no extension or unsupported extension:', filePath);
            
            // Try to detect file type based on content (simple method)
            const fileBuffer = fs.readFileSync(filePath);
            const fileHeader = fileBuffer.slice(0, 4).toString('hex').toLowerCase();
            
            if (fileHeader.startsWith('4944330') || fileHeader.startsWith('fffb')) {
                // MP3 header detection
                fileExtension = '.mp3';
            } else if (fileHeader.startsWith('52494646')) {
                // RIFF/WAV header detection
                fileExtension = '.wav';
            } else if (fileHeader.startsWith('4f676753')) {
                // OGG header detection
                fileExtension = '.ogg';
            } else {
                // Default to WAV as fallback
                fileExtension = '.wav';
            }
            
            console.log('Using detected/default extension:', fileExtension);
            
            // Rename the file with the proper extension
            const newFilePath = filePath + fileExtension;
            fs.renameSync(filePath, newFilePath);
            filePath = newFilePath;
        }

        // Create a readable stream from the file
        const fileStream = createReadStream(filePath);
        
        // Call OpenAI API with the file stream
        const response = await openai.audio.transcriptions.create({
            file: fileStream,
            model: "whisper-1",
        });

        return response.text;
    } catch (error: any) {
        console.error('Error in transcribeAudio service:', error);
        // Enhanced error message to include more details about the file
        const errorMessage = error.error?.message || error.message || 'Unknown error';
        throw new Error(`Failed to transcribe audio: ${errorMessage}`);
    }
}

// Helper function to get the correct content type based on file extension
function getContentType(extension: string): string {
    const contentTypes: {[key: string]: string} = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.flac': 'audio/flac',
        '.m4a': 'audio/mp4',
        '.mp4': 'audio/mp4',
        '.mpeg': 'audio/mpeg',
        '.mpga': 'audio/mpeg',
        '.oga': 'audio/ogg',
        '.webm': 'audio/webm'
    };
    
    return contentTypes[extension] || 'application/octet-stream';
}