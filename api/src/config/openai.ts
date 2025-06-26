import { OpenAI } from "openai";
import dotenv from 'dotenv';

dotenv.config();

// Check for API key in environment
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    process.exit(1);
}

// Create OpenAI client instance
const openai = new OpenAI({
    apiKey: apiKey,
});

// Model configuration
const config = {
    textModel: process.env.TEXT_MODEL || 'gpt-3.5-turbo',
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
    imageModel: process.env.IMAGE_MODEL || 'dall-e-3',
    audioModel: process.env.AUDIO_MODEL || 'whisper-1',
};

export { openai, config };