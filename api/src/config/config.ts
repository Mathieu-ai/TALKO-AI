import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    mongo: {
        db: process.env.MONGODB_URI || '',
    },

    // Model configuration
    chatModel: process.env.CHAT_MODEL || 'gpt-4',
    audioModel: process.env.AUDIO_MODEL || 'whisper-1',
    imageModel: process.env.IMAGE_MODEL || 'dall-e-3',

    // App configuration
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',

    // File handling limits
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB default

    // Temporary file paths
    tempDir: process.env.TEMP_DIR || './tmp',
};

// Validate critical configuration
if (!config.openai.apiKey||!config.mongo.db) {
    console.error('MONGODB_URI environment variable is required');
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
}

export default config;
